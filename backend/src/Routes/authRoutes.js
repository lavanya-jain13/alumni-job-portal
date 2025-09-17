const express = require("express");
const router = express.Router();
const {
  registerStudent,
  registerAlumni,
  login,
  forgotPassword,
  verifyForgotPasswordOTP,
  generateEmailVerificationOTP,
} = require("../controllers/AuthController");

router.post("/register/student", registerStudent);

router.post("/register/alumni", registerAlumni);

router.post("/login", login);


module.exports = router;
