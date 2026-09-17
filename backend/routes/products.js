const express = require("express");

const pool = require("../config/db");

const authMiddleware =
require("../middleware/authMiddleware");

const adminMiddleware =
require("../middleware/adminMiddleware");

const upload =
require("../middleware/upload");

const router = express.Router();


// =====================================
// GET ALL PRODUCTS
// =====================================

router.get("/", async (req, res) => {
try {
const [products] = await pool.query(
      `
SELECT *
FROM products
ORDER BY created_at DESC
      `
    );

res.json({
success: true,
products,
    });

  } catch (error) {
console.error(
      "Get products error:",
error
    );

res.status(500).json({
success: false,
message: "Server error",
    });
  }
});


// =====================================
// GET SINGLE PRODUCT
// =====================================

router.get("/:id", async (req, res) => {
try {
const [products] = await pool.query(
      `
SELECT *
FROM products
WHERE id = ?
      `,
      [req.params.id]
    );

if (products.length === 0) {
return res.status(404).json({
success: false,
message: "Product not found",
      });
    }

res.json({
success: true,
product: products[0],
    });

  } catch (error) {
console.error(
      "Get product error:",
error
    );

res.status(500).json({
success: false,
message: "Server error",
    });
  }
});


// =====================================
// CREATE PRODUCT
// ADMIN ONLY
// =====================================

router.post(
  "/",
authMiddleware,
adminMiddleware,
upload.single("image"),

async (req, res) => {
try {



const {
name,
description,
price,
old_price,
category,
stock,
rating,
discount,
featured,
featured_category,
hero
} = req.body;





// =====================================
// SINGLE ACTIVE FEATURE FLAGS
// =====================================

if (Number(hero) === 1) {
await pool.query(
    `UPDATE products SET hero = 0`
  );
}





      // ---------------------------------
      // VALIDATION
      // ---------------------------------

if (!name || price === undefined) {
return res.status(400).json({
success: false,
message:
            "Product name and price are required",
        });
      }


      // ---------------------------------
      // IMAGE
      // ---------------------------------

const image = req.file
        ? req.file.filename
        : null;


      // ---------------------------------
      // INSERT
      // ---------------------------------

const [result] =
await pool.query(
          `
INSERT INTO products
(
name,
description,
price,
old_price,
category,
stock,
image,
rating,
discount,
featured,
featured_category,
hero
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,

[
name,
description || null,
price,
old_price || null,
category || null,
stock || 0,
image,
rating || 0,

Number(discount) === 1 ? 1 : 0,
Number(featured) === 1 ? 1 : 0,
Number(featured_category) === 1 ? 1 : 0,
Number(hero) === 1 ? 1 : 0

]

        );


res.status(201).json({
success: true,

message: "Product created successfully",

product: {
id: result.insertId,
name,
description: description || null,
price,
old_price: old_price || null,
category: category || null,
stock: stock || 0,
image,
rating: rating || 0,

discount:
Number(discount) === 1 ? 1 : 0,

featured:
Number(featured) === 1 ? 1 : 0,

featured_category:
Number(featured_category) === 1 ? 1 : 0,

hero:
Number(hero) === 1 ? 1 : 0,
}

});
      
    } catch (error) {

console.error(
        "Create product error:",
error
      );

res.status(500).json({
success: false,
message: "Server error",
      });
    }
  }
);


// =====================================
// UPDATE PRODUCT
// ADMIN ONLY
// =====================================

router.put(
  "/:id",
authMiddleware,
adminMiddleware,
upload.single("image"),

async (req, res) => {

try {

const {
name,
description,
price,
old_price,
category,
stock,
rating,
discount,
featured,
featured_category,
hero
} = req.body;





// =====================================
// SINGLE ACTIVE FEATURE FLAGS
// =====================================

if (Number(hero) === 1) {
await pool.query(
    `UPDATE products
SET hero = 0
WHERE id != ?`,
    [req.params.id]
  );
}






      // ---------------------------------
      // GET OLD PRODUCT
      // ---------------------------------

const [oldProducts] =
await pool.query(
          `
SELECT image
FROM products
WHERE id = ?
          `,
          [req.params.id]
        );


if (oldProducts.length === 0) {
return res.status(404).json({
success: false,
message: "Product not found",
        });
      }


      // ---------------------------------
      // KEEP OLD IMAGE IF
      // NO NEW IMAGE
      // ---------------------------------

const oldImage =
oldProducts[0].image;


const image = req.file
        ? req.file.filename
        : oldImage;


      // ---------------------------------
      // UPDATE
      // ---------------------------------

const [result] =
await pool.query(
          `
UPDATE products
SET
name = ?,
description = ?,
price = ?,
old_price = ?,
category = ?,
stock = ?,
image = ?,
rating = ?,
discount = ?,
featured = ?,
featured_category = ?,
hero = ?
WHERE id = ?
`,
      
[
name,
description || null,
price,
old_price || null,
category || null,
stock || 0,
image,
rating || 0,

Number(discount) === 1 ? 1 : 0,
Number(featured) === 1 ? 1 : 0,
Number(featured_category) === 1 ? 1 : 0,
Number(hero) === 1 ? 1 : 0,

req.params.id
]
        );


if (result.affectedRows === 0) {
return res.status(404).json({
success: false,
message: "Product not found",
  });
}


const [updatedProducts] =
await pool.query(
    `
SELECT *
FROM products
WHERE id = ?
    `,
    [req.params.id]
  );


res.json({
success: true,

message:
    "Product updated successfully",

product:
updatedProducts[0]
});

    } catch (error) {

console.error(
        "Update product error:",
error
      );

res.status(500).json({
success: false,
message: "Server error",
      });
    }
  }
);


// =====================================
// DELETE PRODUCT
// ADMIN ONLY
// =====================================

router.delete(
  "/:id",
authMiddleware,
adminMiddleware,

async (req, res) => {

try {

const [result] =
await pool.query(
          `
DELETE FROM products
WHERE id = ?
          `,
          [req.params.id]
        );


if (result.affectedRows === 0) {
return res.status(404).json({
success: false,
message: "Product not found",
        });
      }


res.json({
success: true,
message:
          "Product deleted successfully",
      });

    } catch (error) {

console.error(
        "Delete product error:",
error
      );

res.status(500).json({
success: false,
message: "Server error",
      });
    }
  }
);


module.exports = router;

