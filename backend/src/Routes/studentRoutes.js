const express = require("express");
const { completeProfile } = require("../controllers/StudentController");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/profile", authenticate, completeProfile);

module.exports = router;
