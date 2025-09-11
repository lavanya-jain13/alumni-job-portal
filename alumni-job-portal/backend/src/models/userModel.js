const pool = require("../config/db");

// Create a new user
exports.createUser = async (email, passwordHash, role) => {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role) 
     VALUES ($1, $2, $3) RETURNING *`,
    [email, passwordHash, role]
  );
  return result.rows[0];
};

// Find user by email
exports.findByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

// Find user by ID
exports.findById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

// Update user verification status
exports.verifyUser = async (email) => {
  await pool.query(
    "UPDATE users SET is_verified = TRUE, status = 'active' WHERE email = $1",
    [email]
  );
};
