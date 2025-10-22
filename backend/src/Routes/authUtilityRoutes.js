const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/AuthUtilityController");
const { authenticate } = require("../middleware/authMiddleware");

console.log(typeof authenticate + "aaaaaaaaaaaaaaaaa");

// public
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// protected
router.post("/change-password", authenticate, changePassword);

module.exports = router;
