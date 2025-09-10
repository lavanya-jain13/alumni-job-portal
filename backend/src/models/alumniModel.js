const pool = require("../config/db");

exports.createAlumniProfile = async (userId, { name, gradYear, currentTitle }) => {
  const result = await pool.query(
    `INSERT INTO alumni_profiles (user_id, name, grad_year, current_title) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, name, gradYear, currentTitle]
  );
  return result.rows[0];
};

exports.findByUserId = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM alumni_profiles WHERE user_id = $1",
    [userId]
  );
  return result.rows[0];
};
