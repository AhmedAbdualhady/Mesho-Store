const express = require("express");
const nodemailer = require("nodemailer");

const {
contactLimiter,
} = require("../middleware/rateLimiter");


const router = express.Router();


// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({

service: "gmail",

auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS,
  },

});


// =====================================================
// SEND CONTACT MESSAGE
// POST /api/contact
// =====================================================

router.post("/", contactLimiter, async (req, res) => {

try {

const {
name,
email,
message,
    } = req.body;


    // =================================================
    // VALIDATION
    // =================================================

const cleanName =
String(name || "").trim();

const cleanEmail =
String(email || "").trim();

const cleanMessage =
String(message || "").trim();


if (!cleanName) {

return res.status(400).json({

success: false,

message: "Please enter your name.",

      });

    }


if (!cleanEmail) {

return res.status(400).json({

success: false,

message: "Please enter your email.",

      });

    }


if (!cleanMessage) {

return res.status(400).json({

success: false,

message: "Please enter your message.",

      });

    }


    // =================================================
    // EMAIL VALIDATION
    // =================================================

const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


if (!emailRegex.test(cleanEmail)) {

return res.status(400).json({

success: false,

message: "Please enter a valid email address.",

      });

    }


    // =================================================
    // MESSAGE LENGTH
    // =================================================

if (cleanName.length> 100) {

return res.status(400).json({

success: false,

message: "Name is too long.",

      });

    }


if (cleanEmail.length> 150) {

return res.status(400).json({

success: false,

message: "Email is too long.",

      });

    }


if (cleanMessage.length> 5000) {

return res.status(400).json({

success: false,

message: "Message is too long.",

      });

    }


    // =================================================
    // SEND EMAIL
    // =================================================

await transporter.sendMail({

from: `"MeshoStore Contact" <${process.env.EMAIL_USER}>`,

to: process.env.EMAIL_USER,

replyTo: cleanEmail,

subject: `New Contact Message from ${cleanName}`,

text: `
New Contact Message
===================

Name:
${cleanName}

Email:
${cleanEmail}

Message:
${cleanMessage}

===================
MeshoStore Website
      `,

    });


    // =================================================
    // SUCCESS
    // =================================================

return res.status(200).json({

success: true,

message:
        "Your message has been sent successfully.",

    });


  } catch (error) {

console.error(
      "Contact Email Error:",
error
    );


return res.status(500).json({

success: false,

message:
        "Failed to send your message. Please try again later.",

    });

  }

});


module.exports = router;

