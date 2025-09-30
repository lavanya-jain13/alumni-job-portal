// src/controllers/JobApplicationController.js
const knex = require('../config/db');

// DELETE /jobs/apply/:applicationId
exports.withdrawApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;

    const application = await knex('job_applications')
      .where({ id: applicationId, student_id: userId })
      .first();

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await knex('job_applications').where({ id: applicationId }).del();

    res.json({ message: 'Application withdrawn successfully' });
  } catch (err) {
    console.error('Withdraw application error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /jobs/:jobId/applicants
exports.viewApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = req.user;

    // Check if alumni owns the job (unless admin)
    if (user.role === 'alumni') {
      const job = await knex('jobs').where({ id: jobId, alumni_id: user.id }).first();
      if (!job) {
        return res.status(403).json({ error: 'Not authorized to view applicants of this job' });
      }
    }

    const applicants = await knex('job_applications as ja')
      .join('students as s', 'ja.student_id', 's.id')
      .select('ja.id as applicationId', 's.id as studentId', 's.name', 's.email', 'ja.status', 'ja.created_at')
      .where('ja.job_id', jobId);

    res.json({ applicants });
  } catch (err) {
    console.error('View applicants error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
