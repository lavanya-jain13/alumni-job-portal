const pool = require("../config/db");

exports.saveOtp = async (email, otp, expiresAt) => {
  await pool.query(
    `INSERT INTO otp_verifications (email, otp, expires_at) 
     VALUES ($1, $2, $3)`,
    [email, otp, expiresAt]
  );
};

exports.findOtp = async (email, otp) => {
  const result = await pool.query(
    `SELECT * FROM otp_verifications 
     WHERE email = $1 AND otp = $2 AND is_used = FALSE AND expires_at > NOW()`,
    [email, otp]
  );
  return result.rows[0];
};

exports.markOtpUsed = async (id) => {
  await pool.query(
    "UPDATE otp_verifications SET is_used = TRUE WHERE id = $1",
    [id]
  );
};
