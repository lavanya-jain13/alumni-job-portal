const express = require("express");
const { approveAlumni, rejectAlumni } = require("../controllers/AdminController");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.patch("/companies/:companyId/approve", authMiddleware, adminOnly, approveAlumni);
router.patch("/companies/:companyId/reject", authMiddleware, adminOnly, rejectAlumni);

module.exports = router;
