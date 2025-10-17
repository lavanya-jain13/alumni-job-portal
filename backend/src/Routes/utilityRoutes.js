// src/routes/UtilityRoutes.js
const express = require("express");
const router = express.Router();
const UtilityController = require("../controllers/UtilityController");
const {authenticate, isAdmin} = require("../middleware/authMiddleware"); // ensures user is logged in

// ================== Notifications ==================

// GET /notifications - Get logged-in user's notifications
router.get(
  "/notifications",
  authenticate,
  UtilityController.getNotifications
);

// PUT /notifications/:id/read - Mark a notification as read
router.put(
  "/notifications/:id/read",
  authenticate,
  UtilityController.markNotificationRead
);

// ================== Search / Filters ==================

// GET /search/students - Search students
router.get(
  "/search/students",
  authenticate,
  UtilityController.searchStudents
);

// GET /search/alumni - Search alumni
router.get("/search/alumni", authenticate, UtilityController.searchAlumni);

module.exports = router;
