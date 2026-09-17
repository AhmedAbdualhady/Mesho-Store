const express = require("express");
const router = express.Router();

const db = require("../config/db");
const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");

const {
orderLimiter,
} = require("../middleware/rateLimiter");


// =====================================================
// SHIPPING PRICES
// =====================================================

const SHIPPING_PRICES = {
pickup: 0,
standard: 15,
express: 30,
};


// =====================================================
// ALLOWED PAYMENT METHODS
// =====================================================

const ALLOWED_PAYMENT_METHODS = [
  "bank",
  "wallet",
  "cash",
  "card",
];


// =====================================================
// ALLOWED SHIPPING METHODS
// =====================================================

const ALLOWED_SHIPPING_METHODS = [
  "pickup",
  "standard",
  "express",
];


// =====================================================
// ALLOWED ORDER STATUSES
// =====================================================

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

// =====================================================
// CREATE ORDER
// POST /api/orders
// =====================================================

router.post(
  "/",
auth,
orderLimiter,
upload.single("paymentImage"),
async (req, res) => {


const connection = await db.getConnection();

try {

const {
customer_name,
phone,
address,
payment_method,
shipping_method,
items,
      } = req.body;


      // =================================================
      // AUTHENTICATED USER
      // =================================================

const userId = Number(req.user?.id);


if (
        !Number.isInteger(userId) ||
userId <= 0
      ) {

return res.status(401).json({
success: false,
message: "Authentication required",
        });

      }


      // =================================================
      // REQUIRED FIELDS
      // =================================================

if (
        !customer_name ||
        !phone ||
        !address ||
        !payment_method ||
        !shipping_method ||
        !items
      ) {

return res.status(400).json({
success: false,
message: "Please fill all required fields",
        });

      }


      // =================================================
      // CLEAN CUSTOMER DATA
      // =================================================

const cleanName =
String(customer_name).trim();

const cleanPhone =
String(phone).trim();

const cleanAddress =
String(address).trim();


if (
cleanName.length < 2 ||
cleanName.length > 100
      ) {

return res.status(400).json({
success: false,
message: "Invalid customer name",
        });

      }


if (
cleanPhone.length < 8 ||
cleanPhone.length > 30
      ) {

return res.status(400).json({
success: false,
message: "Invalid phone number",
        });

      }


if (
cleanAddress.length < 3 ||
cleanAddress.length > 500
      ) {

return res.status(400).json({
success: false,
message: "Invalid address",
        });

      }


      // =================================================
      // PAYMENT METHOD VALIDATION
      // =================================================

if (
        !ALLOWED_PAYMENT_METHODS.includes(
payment_method
        )
      ) {

return res.status(400).json({
success: false,
message: "Invalid payment method",
        });

      }


      // =================================================
      // SHIPPING METHOD VALIDATION
      // =================================================

if (
        !ALLOWED_SHIPPING_METHODS.includes(
shipping_method
        )
      ) {

return res.status(400).json({
success: false,
message: "Invalid shipping method",
        });

      }


      // =================================================
      // PAYMENT PROOF
      // =================================================

const requiresPaymentProof =
payment_method === "bank" ||
payment_method === "wallet";


if (
requiresPaymentProof&&
        !req.file
      ) {

return res.status(400).json({
success: false,
message:
            "Payment proof is required for this payment method",
        });

      }


const payment_image =
req.file
          ? req.file.filename
          : null;


      // =================================================
      // PARSE ITEMS
      // =================================================

let parsedItems;

try {

parsedItems =
typeof items === "string"
            ? JSON.parse(items)
            : items;

      } catch (error) {

return res.status(400).json({
success: false,
message: "Invalid items data",
        });

      }


      // =================================================
      // CART VALIDATION
      // =================================================

if (
        !Array.isArray(parsedItems) ||
parsedItems.length === 0
      ) {

return res.status(400).json({
success: false,
message: "Cart is empty",
        });

      }


if (
parsedItems.length > 100
      ) {

return res.status(400).json({
success: false,
message: "Too many products in order",
        });

      }


      // =================================================
      // START TRANSACTION
      // =================================================

await connection.beginTransaction();


      // =================================================
      // VERIFY USER EXISTS
      // =================================================

const [users] =
await connection.execute(
          `
SELECT
id,
name,
email
FROM users
WHERE id = ?
          `,
          [userId]
        );


if (
users.length === 0
      ) {

const error =
new Error("User account not found");

error.code =
          "USER_NOT_FOUND";

throw error;

      }


      // =================================================
      // CALCULATE SUBTOTAL
      // =================================================

let subtotal = 0;


      // =================================================
      // CHECK PRODUCTS + DECREASE STOCK
      // =================================================

for (
const item of parsedItems
      ) {

const productId =
Number(
item.product_id ??
item.id
          );


const quantity =
Number(item.quantity);


        // ===============================================
        // ITEM VALIDATION
        // ===============================================

if (
          !Number.isInteger(productId) ||
productId <= 0 ||
          !Number.isInteger(quantity) ||
quantity <= 0
        ) {

const error =
new Error(
              "Invalid product or quantity"
            );

error.code =
            "INVALID_ITEM";

throw error;

        }


        // ===============================================
        // LOCK PRODUCT
        // ===============================================

const [products] =
await connection.execute(
            `
SELECT
id,
name,
price,
stock
FROM products
WHERE id = ?
FOR UPDATE
            `,
            [productId]
          );


        // ===============================================
        // PRODUCT NOT FOUND
        // ===============================================

if (
products.length === 0
        ) {

const error =
new Error(
              `Product ${productId} not found`
            );

error.code =
            "PRODUCT_NOT_FOUND";

throw error;

        }


const product =
products[0];


const stock =
Number(product.stock) || 0;


const realPrice =
Number(product.price);


        // ===============================================
        // PRICE VALIDATION
        // ===============================================

if (
          !Number.isFinite(realPrice) ||
realPrice < 0
        ) {

const error =
new Error(
              `Invalid price for ${product.name}`
            );

error.code =
            "INVALID_PRICE";

throw error;

        }


        // ===============================================
        // STOCK CHECK
        // ===============================================

if (
stock < quantity
        ) {

const error =
new Error(
              `${product.name} does not have enough stock`
            );

error.code =
            "INSUFFICIENT_STOCK";

throw error;

        }


        // ===============================================
        // SAFE STOCK UPDATE
        // ===============================================

const [updateResult] =
await connection.execute(
            `
UPDATE products

SET stock = stock - ?

WHERE id = ?

AND stock>= ?
            `,
            [
quantity,
productId,
quantity,
            ]
          );


        // ===============================================
        // RACE CONDITION PROTECTION
        // ===============================================

if (
updateResult.affectedRows !== 1
        ) {

const error =
new Error(
              `${product.name} is out of stock`
            );

error.code =
            "INSUFFICIENT_STOCK";

throw error;

        }


        // ===============================================
        // CALCULATE SUBTOTAL
        // ===============================================

subtotal +=
realPrice * quantity;


// Save real DB data
// for order

item.name =
product.name;

item.realPrice =
realPrice;

      }


      // =================================================
      // SHIPPING
      // =================================================

const shipping =
Number(
SHIPPING_PRICES[
shipping_method
          ]
        );


      // =================================================
      // FINAL TOTAL
      // =================================================

const orderTotal =
subtotal + shipping;


      // =================================================
      // CREATE ORDER
      // =================================================

const [orderResult] =
await connection.execute(
          `
INSERT INTO orders
          (
user_id,
customer_name,
phone,
address,
total,
payment_method,
payment_image,
items,
status,
shipping_method
          )

VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
userId,
cleanName,
cleanPhone,
cleanAddress,
orderTotal,
payment_method,
payment_image,
JSON.stringify(parsedItems),
            "pending",
shipping_method,
          ]
        );


const orderId =
orderResult.insertId;


      // =================================================
      // CREATE ORDER ITEMS
      // =====================================================

for (
const item of parsedItems
      ) {

const productId =
Number(
item.product_id ??
item.id
          );


const quantity =
Number(item.quantity);


const price =
Number(item.realPrice);


await connection.execute(
          `
INSERT INTO order_items
          (
order_id,
product_id,
quantity,
price
          )

VALUES (?, ?, ?, ?)
          `,
          [
orderId,
productId,
quantity,
price,
          ]
        );

      }


      // =================================================
      // COMMIT
      // =================================================

await connection.commit();


      // =================================================
      // SUCCESS RESPONSE
      // =================================================

return res.status(201).json({

success: true,

message:
          "Order placed successfully",

orderId,

subtotal:
Number(
subtotal.toFixed(2)
          ),

shipping:
Number(
shipping.toFixed(2)
          ),

shipping_method,

total:
Number(
orderTotal.toFixed(2)
          ),

      });


    } catch (error) {


      // =================================================
      // ROLLBACK
      // =================================================

await connection.rollback();


console.error(
        "Create Order Error:",
error
      );


      // =================================================
      // STOCK ERROR
      // =================================================

if (
error.code ===
        "INSUFFICIENT_STOCK"
      ) {

return res.status(409).json({

success: false,

message:
error.message,

        });

      }


      // =================================================
      // PRODUCT NOT FOUND
      // =================================================

if (
error.code ===
        "PRODUCT_NOT_FOUND"
      ) {

return res.status(404).json({

success: false,

message:
error.message,

        });

      }


      // =================================================
      // INVALID ITEM
      // =================================================

if (
error.code ===
        "INVALID_ITEM"
      ) {

return res.status(400).json({

success: false,

message:
error.message,

        });

      }


      // =================================================
      // USER ERROR
      // =================================================

if (
error.code ===
          "USER_NOT_FOUND"
      ) {

return res.status(401).json({

success: false,

message:
            "Authentication required",

        });

      }


      // =================================================
      // INVALID PRICE
      // =================================================

if (
error.code ===
          "INVALID_PRICE"
      ) {

return res.status(500).json({

success: false,

message:
            "Invalid product price",

        });

      }


      // =================================================
      // OTHER ERROR
      // =================================================

return res.status(500).json({

success: false,

message:
          "Failed to create order",

      });

    } finally {

connection.release();

    }

  }
);


// =====================================================
// GET ALL ORDERS
// GET /api/orders
// ADMIN ONLY
// =====================================================

router.get(
  "/",
auth,
async (req, res) => {

try {

      // -----------------------------------------------
      // ADMIN CHECK
      // -----------------------------------------------

if (
Number(req.user?.is_admin) !== 1
      ) {

return res.status(403).json({

success: false,

message:
            "Admin access required",

        });

      }


const [orders] =
await db.execute(
          `
SELECT
o.*,
u.name AS user_name,
u.email AS user_email

FROM orders o

LEFT JOIN users u
ON u.id = o.user_id

ORDER BY o.id DESC
          `
        );


return res.json(
orders
      );


    } catch (error) {

console.error(
        "Get Orders Error:",
error
      );


return res.status(500).json({

success: false,

message:
          "Failed to fetch orders",

      });

    }

  }
);


// =====================================================
// GET ONE ORDER
// GET /api/orders/:id
// USER OR ADMIN
// =====================================================

router.get(
  "/:id",
auth,
async (req, res) => {

try {

const orderId =
Number(req.params.id);


if (
        !Number.isInteger(orderId) ||
orderId <= 0
      ) {

return res.status(400).json({

success: false,

message:
            "Invalid order ID",

        });

      }


      // -----------------------------------------------
      // GET ORDER
      // -----------------------------------------------

const [orders] =
await db.execute(
          `
SELECT *
FROM orders
WHERE id = ?
          `,
          [orderId]
        );


if (
orders.length === 0
      ) {

return res.status(404).json({

success: false,

message:
            "Order not found",

        });

      }


const order =
orders[0];


      // -----------------------------------------------
      // OWNER / ADMIN PROTECTION
      // -----------------------------------------------

const isAdmin =
Number(req.user?.is_admin) === 1;

const isOwner =
Number(order.user_id) ===
Number(req.user?.id);


if (
        !isAdmin&&
        !isOwner
      ) {

return res.status(403).json({

success: false,

message:
            "You are not allowed to view this order",

        });

      }


      // -----------------------------------------------
      // ORDER ITEMS
      // -----------------------------------------------

const [items] =
await db.execute(
          `
SELECT
oi.id,
oi.product_id,
oi.quantity,
oi.price,
p.name,
p.image

FROM order_items oi

LEFT JOIN products p
ON p.id = oi.product_id

WHERE oi.order_id = ?
          `,
          [orderId]
        );


return res.json({

        ...order,

order_items:
items,

      });


    } catch (error) {

console.error(
        "Get Order Error:",
error
      );


return res.status(500).json({

success: false,

message:
          "Failed to fetch order",

      });

    }

  }
);


// =====================================================
// UPDATE ORDER STATUS
// PUT /api/orders/:id
// ADMIN ONLY
// =====================================================

router.put(
  "/:id",
auth,
async (req, res) => {

try {

      // -----------------------------------------------
      // ADMIN CHECK
      // -----------------------------------------------

if (
Number(req.user?.is_admin) !== 1
      ) {

return res.status(403).json({

success: false,

message:
            "Admin access required",

        });

      }


const orderId =
Number(req.params.id);


const {
status
      } = req.body;


      // -----------------------------------------------
      // STATUS VALIDATION
      // -----------------------------------------------

if (
        !ALLOWED_STATUSES.includes(
status
        )
      ) {

return res.status(400).json({

success: false,

message:
            "Invalid order status",

        });

      }


      // -----------------------------------------------
      // UPDATE
      // -----------------------------------------------

const [result] =
await db.execute(
          `
UPDATE orders

SET status = ?

WHERE id = ?
          `,
          [
status,
orderId,
          ]
        );


if (
result.affectedRows === 0
      ) {

return res.status(404).json({

success: false,

message:
            "Order not found",

        });

      }


return res.json({

success: true,

message:
          "Order status updated",

      });


    } catch (error) {

console.error(
        "Update Order Error:",
error
      );


return res.status(500).json({

success: false,

message:
          "Failed to update order",

      });

    }

  }
);


// =====================================================
// RATE ORDER
// PUT /api/orders/:id/rating
// USER / ORDER OWNER
// =====================================================

router.put(
  "/:id/rating",
auth,
async (req, res) => {

try {

const orderId =
Number(req.params.id);


const rating =
Number(req.body.rating);


      // -----------------------------------------------
      // RATING VALIDATION
      // -----------------------------------------------

if (
        !Number.isInteger(rating) ||
rating < 1 ||
rating > 5
      ) {

return res.status(400).json({

success: false,

message:
            "Rating must be between 1 and 5",

        });

      }


      // -----------------------------------------------
      // GET ORDER OWNER
      // -----------------------------------------------

const [orders] =
await db.execute(
          `
SELECT
id,
user_id,
status

FROM orders

WHERE id = ?
          `,
          [orderId]
        );


if (
orders.length === 0
      ) {

return res.status(404).json({

success: false,

message:
            "Order not found",

        });

      }


const order =
orders[0];


      // -----------------------------------------------
      // ONLY OWNER CAN RATE
      // -----------------------------------------------

if (
Number(order.user_id) !==
Number(req.user?.id)
      ) {

return res.status(403).json({

success: false,

message:
            "You are not allowed to rate this order",

        });

      }


      // -----------------------------------------------
      // OPTIONAL:
      // ONLY DELIVERED ORDERS CAN BE RATED
      // -----------------------------------------------

if (
order.status !== "delivered"
      ) {

return res.status(400).json({

success: false,

message:
            "Only delivered orders can be rated",

        });

      }


      // -----------------------------------------------
      // SAVE RATING
      // -----------------------------------------------

const [result] =
await db.execute(
          `
UPDATE orders

SET rating = ?

WHERE id = ?
          `,
          [
rating,
orderId,
          ]
        );


if (
result.affectedRows === 0
      ) {

return res.status(400).json({

success: false,

message:
            "Rating was not updated",

        });

      }


return res.json({

success: true,

message:
          "Order rated successfully",

      });


    } catch (error) {

console.error(
        "Rating Error:",
error
      );


return res.status(500).json({

success: false,

message:
          "Failed to rate order",

      });

    }

  }
);


module.exports = router;

