// Hardcoded environment variables (no .env file needed)
process.env.PORT = 5000;
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_USER = "postgres";
process.env.DB_PASSWORD = "lavanyaa@1";
process.env.DB_NAME = "alumni_portal";

process.env.JWT_SECRET = "your_jwt_secret"; // must match authMiddleware secret

process.env.EMAIL_HOST = "smtp.gmail.com";
process.env.EMAIL_PORT = "587";
process.env.EMAIL_USER = "deepslava13@gmail.com";
process.env.EMAIL_PASS = "hkmheyontikkyzpb"; // app password (no spaces)

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./Routes/authRoutes");
const studentRoutes = require("./Routes/studentRoutes");
const alumniRoutes = require("./Routes/alumniRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const authUtilityRoutes = require("./Routes/authUtilityRoutes");

// const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/authUtil", authUtilityRoutes);

// ==================== HEALTH CHECK ====================
app.get("/", (req, res) => {
  res.send("✅ SGSITS Alumni Job Portal Backend is running...");
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
