const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const paymentRoutes =
require("./routes/payment");
const settingsRoutes = require("./routes/settings");
const contactRoutes =
require("./routes/contact");







const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
express.static(
path.join(__dirname, "uploads")
  )
);


app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use(
  "/api/payment-settings",
paymentRoutes
);
app.use("/api/settings", settingsRoutes);
app.use("/api/contact", contactRoutes);




app.get("/", (req, res) => {

res.json({
message: "MeshoStore API is running🚀"
  });

});


app.get("/api/test-db", async (req, res) => {

try {

const [rows] = await pool.query(
      "SELECT 1 AS result"
    );

res.json({

success: true,

message: "MySQL connected successfully🚀",

data: rows

    });

  } catch (error) {

console.error(error);

res.status(500).json({

success: false,

message: "Database connection failed"

    });

  }

});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

console.log(
    `Server running on port ${PORT}`
  );

});


