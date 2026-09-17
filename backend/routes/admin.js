const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
  "/test",
authMiddleware,
adminMiddleware,
  (req, res) => {
res.json({
success: true,
message: "Admin access granted🚀",
user: req.user,
    });
  }
);

module.exports = router;

