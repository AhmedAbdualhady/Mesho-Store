const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================
// UPLOADS DIRECTORY
// =====================================

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
fs.mkdirSync(uploadDir, {
recursive: true,
  });
}

// =====================================
// STORAGE
// =====================================

const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, uploadDir);
  },

filename: (req, file, cb) => {
const extension = path.extname(file.originalname).toLowerCase();

const uniqueName =
Date.now() +
      "-" +
Math.round(Math.random() * 1e9) +
extension;

cb(null, uniqueName);
  },
});

// =====================================
// FILE FILTER
// =====================================

const fileFilter = (req, file, cb) => {
const allowedExtensions =
    /\.(jpg|jpeg|png|webp)$/i;

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

const extensionAllowed =
allowedExtensions.test(file.originalname);

const mimeAllowed =
allowedMimeTypes.includes(file.mimetype);

if (extensionAllowed && mimeAllowed) {
cb(null, true);
  } else {
cb(
new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      )
    );
  }
};

// =====================================
// MULTER
// =====================================

const upload = multer({
storage,

fileFilter,

limits: {
fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;


