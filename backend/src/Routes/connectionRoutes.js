// src/Routes/connectionRoutes.js
const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/ConnectionController");
const authMiddleware = require("../middleware/authMiddleware");

// =================== Connection Routes ===================

// Send connection request
router.post("/connections/request", authMiddleware, connectionController.sendRequest);

// Accept connection request
router.put("/connections/:id/accept", authMiddleware, connectionController.acceptRequest);

// Reject connection request
router.put("/connections/:id/reject", authMiddleware, connectionController.rejectRequest);

// List all connections of logged-in user
router.get("/connections", authMiddleware, connectionController.getConnections);

module.exports = router;
