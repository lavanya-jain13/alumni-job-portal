const db = require("../config/db");
const { sendEmail } = require("../services/emailService");

// Alumni completes profile + company info
const completeProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { gradYear, currentTitle, linkedin, company } = req.body;

    await db("alumni_profiles").where({ user_id: userId }).update({
      grad_year: gradYear,
      current_title: currentTitle,
      linkedin
    });

    await db("companies").where({ alumni_id: userId }).update({
      name: company.name,
      website: company.website,
      industry: company.industry,
      company_size: company.size,
      about: company.about,
      socials: company.linkedin,
      status: "pending"
    });

    // Notify admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      "New Alumni Approval Required",
      `Alumni with user ID ${userId} has submitted company info for approval.`
    );

    res.json({ message: "Alumni profile submitted. Awaiting admin approval." });
  } catch (error) {
    console.error("Alumni Profile Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Alumni posts job (only if approved + profile ≥70% complete)
const postJob = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await db("users").where({ id: userId }).first();

    if (user.status !== "approved") {
      return res.status(403).json({ error: "Wait for admin approval before posting jobs." });
    }

    const profile = await db("alumni_profiles").where({ user_id: userId }).first();

    // Simple profile completion check (expand as needed)
    let completionPercent = 0;
    if (profile.grad_year) completionPercent += 25;
    if (profile.current_title) completionPercent += 25;
    if (profile.linkedin) completionPercent += 20;
    const company = await db("companies").where({ alumni_id: userId }).first();
    if (company && company.name && company.website) completionPercent += 30;

    if (completionPercent < 70) {
      return res.status(400).json({ error: "Complete at least 70% of your profile before posting jobs." });
    }

    const { title, description, requirements } = req.body;

    await db("postings").insert({
      owner_user_id: userId,
      company_id: company.id,
      type: "job",
      title,
      description,
      requirements,
      status_tag: "accepting"
    });

    res.json({ message: "Job posted successfully" });
  } catch (error) {
    console.error("Post Job Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { completeProfile, postJob };
