const express = require("express");
const { completeProfile, postJob } = require("../controllers/AlumniController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/profile", authMiddleware, completeProfile);
router.post("/post-job", authMiddleware, postJob);

module.exports = router;
