const express = require("express");
const { approveAlumni, rejectAlumni } = require("../controllers/AdminController");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.patch("/companies/:companyId/approve", authenticate, isAdmin, approveAlumni);
router.patch("/companies/:companyId/reject", authenticate, isAdmin, rejectAlumni);

module.exports = router;
