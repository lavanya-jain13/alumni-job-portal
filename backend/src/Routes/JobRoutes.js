const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  postJob,
  getJobs,
  getJobById,
  deleteJob,
} = require("../controllers/JobController");

// Alumni can post jobs
router.post("/", protect, authorize("alumni"), postJob);
// Anyone can view jobs
router.get("/", protect, getJobs);
router.get("/:id", protect, getJobById);
// Admin can delete jobs
router.delete("/:id", protect, authorize("admin"), deleteJob);

module.exports = router;
