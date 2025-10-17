const express = require("express");
const { completeProfile, postJob } = require("../controllers/AlumniController");
const { authenticate, isAdmin} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/profile", authenticate, completeProfile);
router.post("/post-job", authenticate, postJob);

module.exports = router;
