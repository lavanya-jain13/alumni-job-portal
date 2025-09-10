const pool = require("../config/db");

exports.createStudentProfile = async (userId, { name, studentId, branch, gradYear, skills, resumeUrl }) => {
  const result = await pool.query(
    `INSERT INTO student_profiles (user_id, name, student_id, branch, grad_year, skills, resume_url) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [userId, name, studentId, branch, gradYear, skills, resumeUrl]
  );
  return result.rows[0];
};

exports.findByUserId = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM student_profiles WHERE user_id = $1",
    [userId]
  );
  return result.rows[0];
};
