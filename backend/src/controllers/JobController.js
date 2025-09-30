const asyncHandler = require("express-async-handler");
const Job = require("../models/Job");

// @desc Post new job (Alumni only)
exports.postJob = asyncHandler(async (req, res) => {
  const { title, description, company, location } = req.body;
  const job = await Job.create({
    title,
    description,
    company,
    location,
    postedBy: req.user.id,
  });
  res.status(201).json(job);
});

// @desc Get all jobs
exports.getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate("postedBy", "name email");
  res.json(jobs);
});

// @desc Get single job details
exports.getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("postedBy", "name email");
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  res.json(job);
});

// @desc Delete job (Admin only)
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }
  res.json({ message: "Job removed" });
});