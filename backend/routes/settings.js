const express = require("express");

const router = express.Router();

const db = require("../config/db");

const upload = require("../middleware/upload");

const auth = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


// =====================================================
// GET WEBSITE SETTINGS
// PUBLIC
// =====================================================

router.get("/", async (req, res) => {

try {

const [rows] = await db.query(
      "SELECT * FROM website_settings WHERE id = 1 LIMIT 1"
    );


    // لولسهمافيsettings
if (rows.length === 0) {

return res.json({

id: 1,

restaurant_name: "",

logo: "",
navbar_subtitle: "",

about: "",

phone: "",
email: "",
address: "",

facebook: "",
instagram: "",
whatsapp: "",

hero_title: "",
hero_description: "",
hero_button: "",

discount_title: "",
discount_description: "",

bank_name: "",
account_name: "",
account_number: "",

wallet_name: "",
wallet_number: "",

delivery_time: "",


pickup_shipping_price: 0,
standard_shipping_price: 15,
express_shipping_price: 30,
express_delivery_time: "1 - 2 Days"


      });

    }


res.json(rows[0]);


  } catch (error) {

console.error(
      "Settings GET Error:",
error
    );


res.status(500).json({

success: false,

message: "Failed to load settings"

    });

  }

});


// =====================================================
// SAVE / UPDATE WEBSITE SETTINGS
// ADMIN ONLY
// =====================================================

router.put(
  "/",
auth,
adminMiddleware,
upload.single("logo"),
async (req, res) => {

try {

const {

restaurant_name,

navbar_subtitle,

about,

phone,
email,
address,

facebook,
instagram,
whatsapp,

hero_title,
hero_description,
hero_button,

discount_title,
discount_description,

bank_name,
account_name,
account_number,

wallet_name,
wallet_number,

delivery_time,

pickup_shipping_price,
standard_shipping_price,
express_shipping_price,
express_delivery_time

      } = req.body;

let logoPath = req.body.logo || "";

if (req.file) {

logoPath =
    `/uploads/${req.file.filename}`;

} else {

const [rows] =
await db.query(
      "SELECT logo FROM website_settings WHERE id = 1 LIMIT 1"
    );

logoPath =
rows[0]?.logo || "";

}


      // =================================================
      // INSERT IF NOT EXISTS
      // UPDATE IF EXISTS
      // =================================================

await db.query(

        `
INSERT INTO website_settings (

id,

restaurant_name,

logo,
navbar_subtitle,

about,

phone,
email,
address,

facebook,
instagram,
whatsapp,

hero_title,
hero_description,
hero_button,

discount_title,
discount_description,

bank_name,
account_name,
account_number,

wallet_name,
wallet_number,

delivery_time,

pickup_shipping_price,
standard_shipping_price,
express_shipping_price,
express_delivery_time


        )



VALUES (
  1,

  ?,
  ?,
  ?,

  ?,


          ?,
          ?,
          ?,

          ?,
          ?,
          ?,

          ?,
          ?,
          ?,

          ?,
          ?,

          ?,
          ?,
          ?,

          ?,
          ?,

          ?,


?,
?,
?,
?


        )

ON DUPLICATE KEY UPDATE

restaurant_name = VALUES(restaurant_name),

logo = VALUES(logo),
navbar_subtitle = VALUES(navbar_subtitle),

about = VALUES(about),

phone = VALUES(phone),
email = VALUES(email),
address = VALUES(address),

facebook = VALUES(facebook),
instagram = VALUES(instagram),
whatsapp = VALUES(whatsapp),

hero_title = VALUES(hero_title),
hero_description = VALUES(hero_description),
hero_button = VALUES(hero_button),

discount_title = VALUES(discount_title),
discount_description = VALUES(discount_description),

bank_name = VALUES(bank_name),
account_name = VALUES(account_name),
account_number = VALUES(account_number),

wallet_name = VALUES(wallet_name),
wallet_number = VALUES(wallet_number),

delivery_time = VALUES(delivery_time),


pickup_shipping_price =
VALUES(pickup_shipping_price),

standard_shipping_price =
VALUES(standard_shipping_price),

express_shipping_price =
VALUES(express_shipping_price),

express_delivery_time =
VALUES(express_delivery_time)

        `,

        [

restaurant_name || "",

logoPath,
navbar_subtitle || "",

about || "",

phone || "",
email || "",
address || "",

facebook || "",
instagram || "",
whatsapp || "",

hero_title || "",
hero_description || "",
hero_button || "",

discount_title || "",
discount_description || "",

bank_name || "",
account_name || "",
account_number || "",

wallet_name || "",
wallet_number || "",

delivery_time || "",


Number(pickup_shipping_price) || 0,

Number(standard_shipping_price) || 0,

Number(express_shipping_price) || 0,

express_delivery_time || "1 - 2 Days"


        ]

      );


res.json({

success: true,

message:
          "Settings saved successfully"

      });


    } catch (error) {

console.error(
        "Settings SAVE Error:",
error
      );


res.status(500).json({

success: false,

message:
          "Failed to save settings"

      });

    }

  }
);


module.exports = router;



