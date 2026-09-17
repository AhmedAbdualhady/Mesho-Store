const express = require("express");

const router = express.Router();

const db = require("../config/db");


// =====================================================
// GET PAYMENT SETTINGS
// GET /api/payment-settings
// =====================================================

router.get(
  "/",
async (req, res) => {

try {

const [settings] =
await db.execute(
          `
SELECT *
FROM payment_settings
LIMIT 1
          `
        );


if (
settings.length === 0
      ) {

return res.status(404).json({

success: false,

message:
            "Payment settings not found"

        });

      }


res.json(
settings[0]
      );


    } catch (error) {

console.error(
        "Payment Settings Error:",
error
      );


res.status(500).json({

success: false,

message:
          "Failed to fetch payment settings"

      });

    }

  }
);


module.exports = router;

