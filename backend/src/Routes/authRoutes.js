const express = require("express");
const router = express.Router();
const {
  registerStudent,
  registerAlumni,
  login,
  forgotPasswordGenerateOtp,
  resetPasswordWithOTP,
  generateEmailVerificationOTP,
  verifyEmailWithOTP
} = require("../controllers/AuthController");

// ==================== AUTH ROUTES ====================

// Student signup
router.post("/register/student", registerStudent);

// Alumni signup
router.post("/register/alumni", registerAlumni);

// Login
router.post("/login", login);

// Forgot password (generate OTP)
router.post("/forgot-password", forgotPasswordGenerateOtp);

// Reset password with OTP
router.post("/reset-password", resetPasswordWithOTP);

// Email verification (send OTP)
router.post("/email/send-otp", generateEmailVerificationOTP);

// Verify email with OTP
router.post("/email/verify-otp", verifyEmailWithOTP);

module.exports = router;
