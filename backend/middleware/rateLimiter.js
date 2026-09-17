const rateLimit = require("express-rate-limit");

// =====================================
// AUTH RATE LIMIT
// Login + Register
// =====================================

const authLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
limit: 10,

standardHeaders: "draft-8",
legacyHeaders: false,

message: {
success: false,
message:
      "Too many authentication attempts. Please try again later.",
  },
});


// =====================================
// FORGOT PASSWORD RATE LIMIT
// =====================================

const forgotPasswordLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
limit: 5,

standardHeaders: "draft-8",
legacyHeaders: false,

message: {
success: false,
message:
      "Too many password reset requests. Please try again later.",
  },
});


// =====================================
// RESET PASSWORD RATE LIMIT
// =====================================

const resetPasswordLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
limit: 5,

standardHeaders: "draft-8",
legacyHeaders: false,

message: {
success: false,
message:
      "Too many password reset attempts. Please try again later.",
  },
});


// =====================================
// CONTACT RATE LIMIT
// =====================================

const contactLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
limit: 5,

standardHeaders: "draft-8",
legacyHeaders: false,

message: {
success: false,
message:
      "Too many messages. Please try again later.",
  },
});


// =====================================
// ORDER RATE LIMIT
// =====================================

const orderLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
limit: 20,

standardHeaders: "draft-8",
legacyHeaders: false,

message: {
success: false,
message:
      "Too many order attempts. Please try again later.",
  },
});


module.exports = {
authLimiter,
forgotPasswordLimiter,
resetPasswordLimiter,
contactLimiter,
orderLimiter,
};


