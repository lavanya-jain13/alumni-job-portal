const db = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const SECRET_KEY = "your_jwt_secret";

// ==================== REGISTER STUDENT ====================
const registerStudent = async (req, res) => {
  const { name, role, email, password, branch, currentYear, passingYear } = req.body;

  if (!name || !role || !email || !password || !branch || !currentYear || !passingYear) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (email.split("@")[1] !== "sgsits.ac.in") {
    return res.status(400).json({ error: "Email is not authorised" });
  }
   // change h isme
  const validBranches = [
    "computer science",
    "information technology",
    "electronics and telecommunication",
    "electronics and instrumentation",
    "electrical",
    "mechanical",
    "civil",
    "industrial production"
  ];

  function isValidBranch(branch) {
    return validBranches.some((validBranch) =>
      new RegExp(`^${validBranch}$`, "i").test(branch)
    );
  }

  if (!isValidBranch(branch)) {
    return res.status(400).json({ error: "Branch is incorrect" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db("users").insert({ name, email, password: hashedPassword, role });

  await db("student").insert({
    name,
    email,
    password: hashedPassword,
    branch,
    currentYear,
    passingYear,
    status: "pending"
  });

  res.status(201).json({ message: "User registered successfully" });
};

// ==================== LOGIN ====================
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await db("users").where({ email }).first();
  if (!user) return res.status(400).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: "1h"
  });

  res.json({ token });
};

// ==================== REGISTER ALUMNI ====================
const registerAlumni = async (req, res) => {
  const { name, role, passingYear, email, password, companyEmail, branch } = req.body;

  if (!name || !role || !email || !password || !companyEmail || !passingYear) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // ✅ Enforce business/company email
  const corporateDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "sgsits.ac.in"];

  function isBusinessEmail(email) {
    const domain = email.split("@")[1].toLowerCase();
    return !corporateDomains.includes(domain);
  }

  if (!isBusinessEmail(companyEmail)) {
    return res.status(400).json({ error: "Please use a valid business/company email ID" });
  }

  try {
    const existingAlumni = await db("alumni").where({ email }).first();
    if (existingAlumni) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists or is pending verification." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db("users").insert({ name, email, password: hashedPassword, role });

    await db("alumni").insert({
      name,
      email,
      password: hashedPassword,
      branch,
      passingYear,
      companyEmail,
      status: "pending" // will update after admin approval
    });

    res.status(201).json({
      message:
        "Registration submitted successfully. You will receive an email once your account has been verified by an administrator."
    });
  } catch (error) {
    console.error("Alumni Registration Error:", error);
    res.status(500).json({ error: "An error occurred during registration. Please try again." });
  }
};

// ==================== OTP GENERATION ====================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // always 6 digits
};

// ==================== EMAIL SENDER ====================
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
};

// ==================== FORGOT PASSWORD: GENERATE OTP ====================
const forgotPasswordGenerateOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await db("users").where({ email }).first();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    await db("user_otps").insert({
      user_id: user.id,
      otp,
      purpose: "forgot_password",
      expires_at: expiryTime
    });

    await sendEmail(user.email, "Password Reset OTP", `Your OTP is: ${otp}`);

    res.status(200).json({
      message: "OTP sent successfully to registered email",
      expiry: expiryTime
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ==================== RESET PASSWORD WITH OTP ====================
const resetPasswordWithOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Email, OTP, and new password are required" });
  }

  try { 
    const otpEntry = await db("password_resets")
      .where({ email, otp })
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!otpEntry) return res.status(400).json({ error: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db("users").where({ email }).update({ password: hashedPassword });

    await db("password_resets").where({ email, otp }).del();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password Reset Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== EMAIL VERIFICATION OTP =================
const generateEmailVerificationOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db("email_verifications").insert({
      email,
      otp,
      expires_at: expiresAt
    });

    await sendEmail(email, "Email Verification OTP", `Your verification OTP is: ${otp}`);

    res.json({ message: "Verification OTP sent to email." });
  } catch (error) {
    console.error("Email Verification OTP Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== VERIFY EMAIL WITH OTP ====================
const verifyEmailWithOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

  try {
    const otpEntry = await db("email_verifications")
      .where({ email, otp })
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!otpEntry) return res.status(400).json({ error: "Invalid or expired OTP" });

    await db("users").where({ email }).update({ email_verified: true });
    await db("email_verifications").where({ email, otp }).del();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  registerStudent,
  login,
  registerAlumni,
  forgotPasswordGenerateOtp,
  resetPasswordWithOTP,
  generateEmailVerificationOTP,
  verifyEmailWithOTP
};
