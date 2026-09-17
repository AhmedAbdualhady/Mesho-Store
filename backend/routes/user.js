const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../config/db");

const router = express.Router();

const auth = require("../middleware/authMiddleware");


// ============================
// GET USER PROFILE
// ============================

router.get("/profile", authMiddleware, async (req, res) => {

  try {

const [users] = await pool.query(
      `SELECT
        id,
        name,
        email,
is_admin
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );


    if (users.length === 0) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }


res.json({

      success: true,

      user: users[0]

    });


  } catch (error) {

console.error("Profile error:", error);

res.status(500).json({

      success: false,

      message: "Server error"

    });

  }

});





// ============================
// GET USERS COUNT
// GET /api/users/count
// ADMIN ONLY
// ============================

router.get("/count", auth, async (req, res) => {

try {

    // ============================
    // ADMIN CHECK
    // ============================

if (Number(req.user?.is_admin) !== 1) {

return res.status(403).json({
success: false,
message: "Admin access required"
      });

    }


    // ============================
    // COUNT USERS
    // ============================

const [result] = await pool.query(
      `
SELECT COUNT(*) AS totalUsers
FROM users
      `
    );


return res.json({

success: true,

totalUsers:
Number(result[0]?.totalUsers) || 0

    });


  } catch (error) {

console.error(
      "Users Count Error:",
error
    );


return res.status(500).json({

success: false,

message: "Failed to count users"

    });

  }

});



module.exports = router;

