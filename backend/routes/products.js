const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

const COLUMNS = [
  "name",
  "description",
  "price",
  "old_price",
  "category",
  "stock",
  "rating",
  "discount",
  "featured",
  "featured_category",
  "hero",
  "colors",
  "sizes",
];

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

const unique = (list, keyOf) => {
const seen = new Set();
return list.filter((item) => {
const key = keyOf(item).toLowerCase();
if (seen.has(key)) return false;
seen.add(key);
return true;
  });
};

const cleanColors = (value) =>
unique(
toArray(value)
      .map((item) => ({
name: String(item?.name || "").trim().slice(0, 40),
hex: /^#[0-9a-f]{6}$/i.test(String(item?.hex || ""))
          ? item.hex
          : "#cccccc",
      }))
      .filter((item) => item.name),
(item) => item.name
  ).slice(0, 12);

const cleanSizes = (value) =>
unique(
toArray(value)
      .map((item) => String(item || "").trim().slice(0, 40))
      .filter(Boolean),
(item) => item
  ).slice(0, 12);

const present = (row) => ({
  ...row,
colors: cleanColors(row.colors),
sizes: cleanSizes(row.sizes),
});

const flag = (value) => (Number(value) === 1 ? 1 : 0);

const readFields = (body) => {
const discount = flag(body.discount);
const oldPrice =
body.old_price === "" || body.old_price == null
      ? null
      : Number(body.old_price);

return {
name: String(body.name || "").trim(),
description: String(body.description || "").trim() || null,
price: Number(body.price),
old_price: discount === 1 ? oldPrice : null,
category: String(body.category || "").trim() || null,
stock: Math.max(0, parseInt(body.stock, 10) || 0),
rating: Math.min(5, Math.max(0, Number(body.rating) || 0)),
discount,
featured: flag(body.featured),
featured_category: flag(body.featured_category),
hero: flag(body.hero),
colors: JSON.stringify(cleanColors(body.colors)),
sizes: JSON.stringify(cleanSizes(body.sizes)),
  };
};

const validate = (fields) => {
if (!fields.name) return "Product name is required";
if (!Number.isFinite(fields.price) || fields.price < 0) {
return "A valid price is required";
  }
if (
fields.discount === 1&&
    (!Number.isFinite(fields.old_price) || fields.old_price <= fields.price)
  ) {
return "Old price must be greater than the current price";
  }
return null;
};

const serverError = (res, label, error) => {
console.error(label, error);
return res.status(500).json({ success: false, message: "Server error" });
};

router.get("/", async (req, res) => {
try {
const [products] = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
res.json({ success: true, products: products.map(present) });
  } catch (error) {
serverError(res, "Get products error:", error);
  }
});

router.get("/:id", async (req, res) => {
try {
const productId = Number(req.params.id);
if (!Number.isInteger(productId) || productId <= 0) {
return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

const [products] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

if (products.length === 0) {
return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

res.json({ success: true, product: present(products[0]) });
  } catch (error) {
serverError(res, "Get product error:", error);
  }
});

router.post(
  "/",
authMiddleware,
adminMiddleware,
upload.single("image"),
async (req, res) => {
const fields = readFields(req.body);
const problem = validate(fields);

if (problem) {
return res.status(400).json({ success: false, message: problem });
    }

const columns = [...COLUMNS, "image"];
const values = [...COLUMNS.map((column) => fields[column]), req.file?.filename || null];
let connection;

try {
connection = await pool.getConnection();
await connection.beginTransaction();

if (fields.hero === 1) {
await connection.query("UPDATE products SET hero = 0");
      }

const [result] = await connection.query(
        `INSERT INTO products (${columns.join(", ")}) VALUES (${columns
          .map(() => "?")
          .join(", ")})`,
values
      );

await connection.commit();

const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
result.insertId,
      ]);

res.status(201).json({
success: true,
message: "Product created successfully",
product: present(rows[0]),
      });
    } catch (error) {
if (connection) await connection.rollback();
serverError(res, "Create product error:", error);
    } finally {
if (connection) connection.release();
    }
  }
);

router.put(
  "/:id",
authMiddleware,
adminMiddleware,
upload.single("image"),
async (req, res) => {
const productId = Number(req.params.id);

if (!Number.isInteger(productId) || productId <= 0) {
return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

const fields = readFields(req.body);
const problem = validate(fields);

if (problem) {
return res.status(400).json({ success: false, message: problem });
    }

let connection;

try {
connection = await pool.getConnection();
await connection.beginTransaction();

const [existing] = await connection.query(
        "SELECT image FROM products WHERE id = ? FOR UPDATE",
        [productId]
      );

if (existing.length === 0) {
await connection.rollback();
return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

if (fields.hero === 1) {
await connection.query("UPDATE products SET hero = 0 WHERE id != ?", [
productId,
        ]);
      }

const columns = [...COLUMNS, "image"];
const values = [
        ...COLUMNS.map((column) => fields[column]),
req.file?.filename || existing[0].image,
productId,
      ];

await connection.query(
        `UPDATE products SET ${columns
          .map((column) => `${column} = ?`)
          .join(", ")} WHERE id = ?`,
values
      );

await connection.commit();

const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
productId,
      ]);

res.json({
success: true,
message: "Product updated successfully",
product: present(rows[0]),
      });
    } catch (error) {
if (connection) await connection.rollback();
serverError(res, "Update product error:", error);
    } finally {
if (connection) connection.release();
    }
  }
);

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
try {
const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
req.params.id,
    ]);

if (result.affectedRows === 0) {
return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
if (error.code === "ER_ROW_IS_REFERENCED_2") {
return res.status(409).json({
success: false,
message:
          "This product is part of existing orders and cannot be deleted. Set its stock to 0 instead.",
      });
    }
serverError(res, "Delete product error:", error);
  }
});

module.exports = router;

