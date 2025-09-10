const pool = require("../config/db");

exports.createCompany = async (alumniId, { name, website, industry, companySize, about, documentUrl }) => {
  const result = await pool.query(
    `INSERT INTO companies (alumni_id, name, website, industry, company_size, about, document_url, status) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`,
    [alumniId, name, website, industry, companySize, about, documentUrl]
  );
  return result.rows[0];
};

exports.updateCompanyStatus = async (id, status) => {
  const result = await pool.query(
    "UPDATE companies SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  return result.rows[0];
};

exports.findByAlumniId = async (alumniId) => {
  const result = await pool.query(
    "SELECT * FROM companies WHERE alumni_id = $1",
    [alumniId]
  );
  return result.rows[0];
};
