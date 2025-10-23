const knex = require("../config/db");
const db = require("../config/db");
const { sendEmail } = require("../services/emailService");

// Alumni completes profile + company info
const completeProfile = async (req, res) => {
  let trx; // ✅ define here so it's visible in catch block
  try {
    trx = await db.transaction(); // start transaction
    const { id } = req.user;
    const {
      name,
      website,
      industry,
      company_size,
      about,
      linkedin,
      currentTitle,
      gradYear,
    } = req.body;

    // 1️⃣ Update alumni profile
    await trx("alumni_profiles").where({ user_id: id }).update({
      grad_year: gradYear,
      current_title: currentTitle,
      created_at: trx.fn.now(),
    });

    await trx("companies").where({ user_id: id }).update({
      name: name,
      website: website,
      industry: industry,
      company_size: company_size,
      about: about,
      document_url: linkedin,
      created_at: trx.fn.now(),
    });
    // 3️⃣ Notify admin
    const user = await trx("users").where({ id }).select("email").first();
    if (user?.email) {
      await sendEmail(
        user.email,
        "New Alumni Approval Required",
        `Alumni with user ID ${id} has submitted company info for approval.`
      );
    }
    await trx.commit();
    res.json({ message: "Alumni profile submitted. Awaiting admin approval." });
  } catch (error) {
    if (trx) await trx.rollback(); // ✅ rollback only if it exists
    console.error("Alumni Profile Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Alumni posts job (only if approved + profile ≥70% complete)
const postJob = async (req, res) => {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Unauthenticated user." });

    // 1) Alumni profile by user
    const profile = await db("alumni_profiles")
      .select("id", "grad_year", "current_title")
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res.status(400).json({
        error: "Alumni profile not found. Complete your profile first.",
      });
    }

    // 2) Company for that alumni (companies PK = alumni_id)
    const company = await db("companies")
      .select(
        "id",
        "alumni_id",
        "document_url",
        "about",
        "name",
        "website",
        "status"
      )
      .where({ alumni_id: profile.id })
      .first();

    if (!company) {
      return res.status(400).json({
        error: "Company info not found. Submit your company details first.",
      });
    }

    // 3) Completion score
    let completionPercent = 0;
    if (profile.grad_year) completionPercent += 25;
    if (profile.current_title) completionPercent += 25;
    if (company.document_url) completionPercent += 20;
    if (company.about && company.name && company.website)
      completionPercent += 30;

    if (completionPercent < 70) {
      return res.status(400).json({
        error: "Complete at least 70% of your profile before posting jobs.",
        completionPercent,
      });
    }

    // 4) Validate job input
    const { job_title, job_description } = req.body;
    if (!job_title || !job_description) {
      return res
        .status(400)
        .json({ error: "job_title and job_description are required." });
    }

    const role = req.user?.role || roleToAssign;
    console.log("USEr ROLE:", role);

    // 5) Insert job
    await db("jobs").insert({
      company_id: company.id, // ✅ references companies.alumni_id
      posted_by_alumni_id: profile.id, // ✅ references alumni_profiles.id
      job_title,
      job_description,
      created_at: db.fn.now(),
    });

    return res.json({ message: "Job posted successfully" });
  } catch (error) {
    console.error("Post Job Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    await knex("alumni_profiles").where({ user_id: id }).update(req.body);
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { completeProfile, postJob, updateProfile };

// branchwise email,
