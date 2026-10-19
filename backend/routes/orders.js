const express = require("express");
const db = require("../config/db");
const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { orderLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

const DEFAULT_SHIPPING = { pickup: 0, standard: 15, express: 30 };
const PAYMENT_METHODS = ["bank", "wallet", "cash", "card"];
const SHIPPING_METHODS = ["pickup", "standard", "express"];

const NEXT_STATUSES = {
pending: ["confirmed", "cancelled"],
confirmed: ["preparing", "cancelled"],
preparing: ["ready", "cancelled"],
ready: ["delivered", "cancelled"],
delivered: [],
cancelled: [],
};

const httpError = (status, message) =>
Object.assign(new Error(message), { status });

const sendError = (res, error, fallback) => {
if (error.status) {
return res
      .status(error.status)
      .json({ success: false, message: error.message });
  }
console.error(fallback, error);
return res.status(500).json({ success: false, message: fallback });
};

const toArray = (value) => {
if (Array.isArray(value)) return value;
if (typeof value !== "string" || !value.trim()) return [];
try {
const parsed = JSON.parse(value);
return Array.isArray(parsed) ? parsed : [];
  } catch {
return [];
  }
};

const money = (value) => Math.round(Number(value) * 100) / 100;

const getShippingPrices = async (connection) => {
const [rows] = await connection.query(
    `SELECT pickup_shipping_price, standard_shipping_price, express_shipping_price
FROM website_settings WHERE id = 1 LIMIT 1`
  );

if (rows.length === 0) return DEFAULT_SHIPPING;

const read = (value, fallback) => {
const number = Number(value ?? fallback);
return Number.isFinite(number) && number >= 0 ? number : fallback;
  };

return {
pickup: read(rows[0].pickup_shipping_price, DEFAULT_SHIPPING.pickup),
standard: read(rows[0].standard_shipping_price, DEFAULT_SHIPPING.standard),
express: read(rows[0].express_shipping_price, DEFAULT_SHIPPING.express),
  };
};

const pickOption = (value, options, label, productName) => {
if (options.length === 0) return null;

const wanted = String(value || "").trim().toLowerCase();
const match = options.find((option) => option.toLowerCase() === wanted);

if (!match) {
throw httpError(400, `Please choose a ${label} for ${productName}`);
  }

return match;
};

const restoreStock = async (connection, orderId) => {
const [lines] = await connection.query(
    "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
    [orderId]
  );

for (const line of lines) {
await connection.query(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      [line.quantity, line.product_id]
    );
  }
};

const changeStatus = async (orderId, nextStatus, { userId, isAdmin }) => {
const connection = await db.getConnection();

try {
await connection.beginTransaction();

const [rows] = await connection.query(
      "SELECT id, user_id, status FROM orders WHERE id = ? FOR UPDATE",
      [orderId]
    );

if (rows.length === 0) throw httpError(404, "Order not found");

const order = rows[0];

if (!isAdmin) {
if (Number(order.user_id) !== Number(userId)) {
throw httpError(403, "You are not allowed to change this order");
      }
if (order.status !== "pending" || nextStatus !== "cancelled") {
throw httpError(400, "Only pending orders can be cancelled");
      }
    }

if (!(NEXT_STATUSES[order.status] || []).includes(nextStatus)) {
throw httpError(
        400,
        `An order that is ${order.status} cannot become ${nextStatus}`
      );
    }

await connection.query("UPDATE orders SET status = ? WHERE id = ?", [
nextStatus,
orderId,
    ]);

if (nextStatus === "cancelled") {
await restoreStock(connection, orderId);
    }

await connection.commit();
  } catch (error) {
await connection.rollback();
throw error;
  } finally {
connection.release();
  }
};

const parseOrderId = (value) => {
const orderId = Number(value);
if (!Number.isInteger(orderId) || orderId <= 0) {
throw httpError(400, "Invalid order ID");
  }
return orderId;
};

router.post(
  "/",
auth,
orderLimiter,
upload.single("paymentImage"),
async (req, res) => {
let connection;

try {
const userId = Number(req.user?.id);

if (!Number.isInteger(userId) || userId <= 0) {
throw httpError(401, "Authentication required");
      }

const {
customer_name,
phone,
address,
payment_method,
shipping_method,
items,
      } = req.body;

if (
        !customer_name ||
        !phone ||
        !address ||
        !payment_method ||
        !shipping_method ||
        !items
      ) {
throw httpError(400, "Please fill all required fields");
      }

const name = String(customer_name).trim();
const cleanPhone = String(phone).trim();
const cleanAddress = String(address).trim();

if (name.length < 2 || name.length > 100) {
throw httpError(400, "Invalid customer name");
      }
if (cleanPhone.length < 8 || cleanPhone.length > 30) {
throw httpError(400, "Invalid phone number");
      }
if (cleanAddress.length < 3 || cleanAddress.length > 500) {
throw httpError(400, "Invalid address");
      }
if (!PAYMENT_METHODS.includes(payment_method)) {
throw httpError(400, "Invalid payment method");
      }
if (!SHIPPING_METHODS.includes(shipping_method)) {
throw httpError(400, "Invalid shipping method");
      }
if (["bank", "wallet"].includes(payment_method) && !req.file) {
throw httpError(
          400,
          "Payment proof is required for this payment method"
        );
      }

let rawItems;

try {
rawItems = typeof items === "string" ? JSON.parse(items) : items;
      } catch {
throw httpError(400, "Invalid items data");
      }

if (!Array.isArray(rawItems) || rawItems.length === 0) {
throw httpError(400, "Cart is empty");
      }
if (rawItems.length > 100) {
throw httpError(400, "Too many products in order");
      }

const requested = rawItems
        .map((item) => ({
productId: Number(item.product_id ?? item.id),
quantity: Number(item.quantity),
color: item.color,
size: item.size,
        }))
        .sort((a, b) => a.productId - b.productId);

const invalid = requested.some(
        (item) =>
          !Number.isInteger(item.productId) ||
item.productId <= 0 ||
          !Number.isInteger(item.quantity) ||
item.quantity <= 0
      );

if (invalid) throw httpError(400, "Invalid product or quantity");

connection = await db.getConnection();
await connection.beginTransaction();

const [users] = await connection.query(
        "SELECT id FROM users WHERE id = ?",
        [userId]
      );

if (users.length === 0) throw httpError(401, "Authentication required");

const shippingPrices = await getShippingPrices(connection);

let subtotal = 0;
const savedItems = [];

for (const item of requested) {
const [products] = await connection.query(
          `SELECT id, name, price, stock, image, colors, sizes
FROM products WHERE id = ? FOR UPDATE`,
          [item.productId]
        );

if (products.length === 0) {
throw httpError(404, `Product ${item.productId} not found`);
        }

const product = products[0];
const price = Number(product.price);

if (!Number.isFinite(price) || price < 0) {
throw httpError(500, `Invalid price for ${product.name}`);
        }

const color = pickOption(
item.color,
toArray(product.colors).map((entry) => String(entry?.name || "")),
          "color",
product.name
        );

const size = pickOption(
item.size,
toArray(product.sizes).map(String),
          "size",
product.name
        );

const [update] = await connection.query(
          "UPDATE products SET stock = stock - ? WHERE id = ? AND stock>= ?",
          [item.quantity, item.productId, item.quantity]
        );

if (update.affectedRows !== 1) {
throw httpError(409, `${product.name} does not have enough stock`);
        }

subtotal = money(subtotal + price * item.quantity);

savedItems.push({
product_id: product.id,
name: product.name,
image: product.image,
price,
quantity: item.quantity,
color,
size,
        });
      }

const shipping = shippingPrices[shipping_method];
const total = money(subtotal + shipping);

const [orderResult] = await connection.query(
        `INSERT INTO orders
          (user_id, customer_name, phone, address, total, payment_method,
payment_image, items, status, shipping_method)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
userId,
name,
cleanPhone,
cleanAddress,
total,
payment_method,
req.file ? req.file.filename : null,
JSON.stringify(savedItems),
          "pending",
shipping_method,
        ]
      );

const orderId = orderResult.insertId;

for (const item of savedItems) {
await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

await connection.commit();

res.status(201).json({
success: true,
message: "Order placed successfully",
orderId,
subtotal,
shipping: money(shipping),
shipping_method,
total,
      });
    } catch (error) {
if (connection) await connection.rollback();
sendError(res, error, "Failed to create order");
    } finally {
if (connection) connection.release();
    }
  }
);

router.get("/", auth, adminMiddleware, async (req, res) => {
try {
const [orders] = await db.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
FROM orders o
LEFT JOIN users u ON u.id = o.user_id
ORDER BY o.id DESC`
    );

res.json(orders);
  } catch (error) {
sendError(res, error, "Failed to fetch orders");
  }
});

router.get("/my", auth, async (req, res) => {
try {
const [orders] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
      [req.user.id]
    );

res.json({
success: true,
orders: orders.map((order) => ({
id: order.id,
status: order.status,
total: order.total,
shipping_method: order.shipping_method,
payment_method: order.payment_method,
rating: order.rating ?? null,
created_at: order.created_at ?? null,
items: toArray(order.items),
      })),
    });
  } catch (error) {
sendError(res, error, "Failed to fetch your orders");
  }
});

router.get("/:id", auth, async (req, res) => {
try {
const orderId = parseOrderId(req.params.id);

const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [
orderId,
    ]);

if (orders.length === 0) throw httpError(404, "Order not found");

const order = orders[0];
const isAdmin = Number(req.user?.is_admin) === 1;
const isOwner = Number(order.user_id) === Number(req.user?.id);

if (!isAdmin && !isOwner) {
throw httpError(403, "You are not allowed to view this order");
    }

const [items] = await db.query(
      `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.image
FROM order_items oi
LEFT JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = ?`,
      [orderId]
    );

res.json({ ...order, order_items: items });
  } catch (error) {
sendError(res, error, "Failed to fetch order");
  }
});

router.put("/:id/rating", auth, async (req, res) => {
try {
const orderId = parseOrderId(req.params.id);
const rating = Number(req.body.rating);

if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
throw httpError(400, "Rating must be between 1 and 5");
    }

const [orders] = await db.query(
      "SELECT id, user_id, status FROM orders WHERE id = ?",
      [orderId]
    );

if (orders.length === 0) throw httpError(404, "Order not found");

if (Number(orders[0].user_id) !== Number(req.user?.id)) {
throw httpError(403, "You are not allowed to rate this order");
    }

if (orders[0].status !== "delivered") {
throw httpError(400, "Only delivered orders can be rated");
    }

await db.query("UPDATE orders SET rating = ? WHERE id = ?", [
rating,
orderId,
    ]);

res.json({ success: true, message: "Order rated successfully" });
  } catch (error) {
sendError(res, error, "Failed to rate order");
  }
});

router.put("/:id/cancel", auth, async (req, res) => {
try {
const orderId = parseOrderId(req.params.id);

await changeStatus(orderId, "cancelled", {
userId: req.user.id,
isAdmin: false,
    });

res.json({ success: true, message: "Order cancelled" });
  } catch (error) {
sendError(res, error, "Failed to cancel order");
  }
});

router.put("/:id", auth, adminMiddleware, async (req, res) => {
try {
const orderId = parseOrderId(req.params.id);
const status = String(req.body.status || "");

if (!Object.hasOwn(NEXT_STATUSES, status)) {
throw httpError(400, "Invalid order status");
    }

await changeStatus(orderId, status, {
userId: req.user.id,
isAdmin: true,
    });

res.json({ success: true, message: "Order status updated" });
  } catch (error) {
sendError(res, error, "Failed to update order");
  }
});

module.exports = router;

