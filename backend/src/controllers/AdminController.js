const db = require("../config/db");
const { sendEmail } = require("../utils/emailService");

// Approve Alumni + Company
const approveAlumni = async (req, res) => {
  try {
    const { companyId } = req.params;

    await db("companies").where({ id: companyId }).update({ status: "approved" });
    const alumni = await db("alumni_profiles").where({ company_id: companyId }).first();

    await db("users").where({ id: alumni.user_id }).update({ status: "approved" });

    const user = await db("users").where({ id: alumni.user_id }).first();
    await sendEmail(user.email, "Company Approved", "Your company is approved. You can now post jobs.");

    res.json({ message: "Alumni approved successfully" });
  } catch (error) {
    console.error("Approve Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reject Alumni + Company
const rejectAlumni = async (req, res) => {
  try {
    const { companyId } = req.params;

    await db("companies").where({ id: companyId }).update({ status: "rejected" });
    const alumni = await db("alumni_profiles").where({ company_id: companyId }).first();

    await db("users").where({ id: alumni.user_id }).update({ status: "rejected" });

    res.json({ message: "Alumni rejected successfully" });
  } catch (error) {
    console.error("Reject Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { approveAlumni, rejectAlumni };
