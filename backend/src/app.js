const express = require("express");
const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/alumni", require("./routes/alumniRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

module.exports = app;
