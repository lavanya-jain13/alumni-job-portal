const express = require("express");
const { completeProfile } = require("../controllers/StudentController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/profile", authMiddleware, completeProfile);

module.exports = router;
