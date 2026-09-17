const pool = require("../config/db");

const adminMiddleware = async (req, res, next) => {
try {
if (!req.user || !req.user.id) {
return res.status(401).json({
success: false,
message: "Unauthorized",
      });
    }

const [users] = await pool.query(
      `SELECT id, is_admin
FROM users
WHERE id = ?`,
      [req.user.id]
    );

if (users.length === 0) {
return res.status(404).json({
success: false,
message: "User not found",
      });
    }

if (users[0].is_admin !== 1) {
return res.status(403).json({
success: false,
message: "Admin access required",
      });
    }

next();

  } catch (error) {
console.error("Admin middleware error:", error);

res.status(500).json({
success: false,
message: "Server error",
    });
  }
};

module.exports = adminMiddleware;


