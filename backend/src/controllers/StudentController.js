const db = require("../config/db");

// Complete Student Profile
const completeProfile = async (req, res) => {
  try {
    const { userId } = req.user; // middleware will add this
    const { branch, gradYear, skills, resumeUrl } = req.body;

    if (!branch || !gradYear) {
      return res.status(400).json({ error: "Branch and Graduation Year are required" });
    }

    await db("student_profiles").where({ user_id: userId }).update({
      branch,
      grad_year: gradYear,
      skills,
      resume_url: resumeUrl,
    });

    res.json({ message: "Student profile updated successfully" });
  } catch (error) {
    console.error("Student Profile Update Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { completeProfile };
