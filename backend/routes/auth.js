const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const nodemailer = require("nodemailer");

const {
authLimiter,
forgotPasswordLimiter,
resetPasswordLimiter,
} = require("../middleware/rateLimiter");



const router = express.Router();

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS,
  },
});


// ============================
// REGISTER
// ============================

router.post("/register", authLimiter, async (req, res) => {

try {

const {
name,
email,
password
    } = req.body;


if (!name || !email || !password) {

return res.status(400).json({
success: false,
message: "Please fill all fields"
      });

    }


if (password.length< 8) {

return res.status(400).json({
success: false,
message: "Password must be at least 8 characters"
      });

    }


const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );


if (existingUser.length> 0) {

return res.status(409).json({
success: false,
message: "Email already registered"
      });

    }


const hashedPassword = await bcrypt.hash(
password,
      10
    );


const [result] = await pool.query(
      `INSERT INTO users
      (name, email, password)
VALUES (?, ?, ?)`,
      [
name,
email,
hashedPassword
      ]
    );


res.status(201).json({

success: true,

message: "Registered successfully",

user: {
id: result.insertId,
name,
email
      }

    });


  } catch (error) {

console.error("Register error:", error);

res.status(500).json({

success: false,

message: "Server error"

    });

  }

});


// ============================
// LOGIN
// ============================

router.post("/login", authLimiter, async (req, res) => {

try {

const {
email,
password
    } = req.body;


if (!email || !password) {

return res.status(400).json({

success: false,

message: "Please fill all fields"

      });

    }


const [users] = await pool.query(

      `SELECT
id,
name,
email,
password,
is_admin
FROM users
WHERE email = ?`,

      [email]

    );


if (users.length === 0) {

return res.status(401).json({

success: false,

message: "Invalid email or password"

      });

    }


const user = users[0];


const passwordMatch = await bcrypt.compare(
password,
user.password
    );


if (!passwordMatch) {

return res.status(401).json({

success: false,

message: "Invalid email or password"

      });

    }


const token = jwt.sign(

      {
id: user.id,
is_admin: user.is_admin
      },

process.env.JWT_SECRET,

      {
expiresIn: "7d"
      }

    );


res.json({

success: true,

message: "Login successful",

token,

user: {

id: user.id,

name: user.name,

email: user.email,

is_admin: user.is_admin

      }

    });


  } catch (error) {

console.error("Login error:", error);

res.status(500).json({

success: false,

message: "Server error"

    });

  }

});


// ============================
// FORGOT PASSWORD
// ============================

router.post(
  "/forgot-password",
forgotPasswordLimiter,
async (req, res) => {


try {

const { email } = req.body;

if (!email) {
return res.status(400).json({
success: false,
message: "Please enter your email",
      });
    }

const [users] = await pool.query(
      "SELECT id, name FROM users WHERE email = ?",
      [email]
    );

if (users.length === 0) {
return res.status(404).json({
success: false,
message: "Email not registered",
      });
    }

    // Generate 6-digit code
const code = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Save code temporarily
await pool.query(
      `UPDATE users
SET reset_code = ?,
reset_code_expires = DATE_ADD(NOW(), INTERVAL 10 MINUTE)
WHERE email = ?`,
      [code, email]
    );

    // Send email

await transporter.sendMail({
from: `"MeshoStore🛍️" <${process.env.EMAIL_USER}>`,
to: email,
subject: "MeshoStore Password Reset Code",

html: `
<div style="
font-family: Arial, sans-serif;
background:#f4f7ff;
padding:40px 20px;
text-align:center;
    ">

<div style="
max-width:500px;
margin:auto;
background:#ffffff;
border-radius:18px;
padding:35px 25px;
box-shadow:0 10px 30px rgba(36,59,143,0.12);
      ">

<h2 style="
color:#243b8f;
margin-bottom:10px;
font-size:28px;
        ">
MeshoStore🛍️
</h2>

<p style="
color:#555;
font-size:16px;
margin-bottom:25px;
        ">
Password Reset Request
</p>

<p style="
color:#444;
font-size:15px;
line-height:1.6;
        ">
Use the verification code below to reset your MeshoStore password:
</p>

<div style="
margin:25px auto;
padding:18px;
background:#f0f4ff;
border-radius:14px;
border:2px solid #243b8f;
max-width:260px;
        ">

<h1 style="
color:#243b8f;
font-size:38px;
letter-spacing:8px;
margin:0;
          ">
            ${code}
</h1>

</div>

<p style="
color:#666;
font-size:14px;
line-height:1.6;
        ">
This verification code will expire in
<strong style="color:#243b8f;">
            10 minutes
</strong>.
</p>

<p style="
color:#999;
font-size:13px;
margin-top:25px;
        ">
If you didn't request a password reset, you can safely ignore this email.
</p>

<hr style="
border:none;
border-top:1px solid #eee;
margin:25px 0;
        ">

<p style="
color:#243b8f;
font-size:13px;
font-weight:bold;
        ">
MeshoStore
</p>

</div>

</div>
  `,
});

res.json({
success: true,
message: "Verification code sent to your email",
    });

  } catch (error) {

console.error("Forgot password error:", error);

res.status(500).json({
success: false,
message: "Server error",
    });

  }

});


// ============================
// RESET PASSWORD
// ============================

router.post(
  "/reset-password",
resetPasswordLimiter,
async (req, res) => {

  try {

const {
      email,
      code,
newPassword
    } = req.body;


    // Check fields

    if (!email || !code || !newPassword) {

      return res.status(400).json({

        success: false,

        message: "Please fill all fields"

      });

    }


    // Check password length

    if (newPassword.length< 8) {

      return res.status(400).json({

        success: false,

        message: "Password must be at least 8 characters"

      });

    }


    // Find user with valid reset code

const [users] = await pool.query(

      `SELECT id
       FROM users
       WHERE email = ?
       AND reset_code = ?
       AND reset_code_expires> NOW()`,

      [
        email,
        code
      ]

    );


    // Invalid or expired code

    if (users.length === 0) {

      return res.status(400).json({

        success: false,

        message: "Invalid or expired verification code"

      });

    }


    // Hash new password

const hashedPassword = await bcrypt.hash(

newPassword,

      10

    );


    // Update password and remove reset code

    await pool.query(

      `UPDATE users
       SET password = ?,
reset_code = NULL,
reset_code_expires = NULL
       WHERE email = ?`,

      [
hashedPassword,
        email
      ]

    );


    // Success

res.json({

      success: true,

      message: "Password updated successfully"

    });


  } catch (error) {

console.error(

      "Reset password error:",

      error

    );


res.status(500).json({

      success: false,

      message: "Server error"

    });

  }

});


module.exports = router;

