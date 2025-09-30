// src/controllers/UtilityController.js
const db = require("../config/db");

// ================== Notifications ==================

// GET /notifications - Get own notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await db("notifications")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /notifications/:id/read - Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await db("notifications")
      .where({ id, user_id: userId })
      .first();

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    await db("notifications")
      .where({ id })
      .update({ is_read: true, updated_at: new Date() });

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================== Search / Filters ==================

// GET /search/students - Search students
exports.searchStudents = async (req, res) => {
  try {
    const { name, branch, year } = req.query;

    let query = db("students").select("id", "name", "email", "branch", "year");

    if (name) query = query.whereILike("name", `%${name}%`);
    if (branch) query = query.where("branch", branch);
    if (year) query = query.where("year", year);

    const students = await query;

    res.json({ success: true, data: students });
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /search/alumni - Search alumni
exports.searchAlumni = async (req, res) => {
  try {
    const { name, company, year } = req.query;

    let query = db("alumni").select(
      "id",
      "name",
      "email",
      "company",
      "graduation_year"
    );

    if (name) query = query.whereILike("name", `%${name}%`);
    if (company) query = query.whereILike("company", `%${company}%`);
    if (year) query = query.where("graduation_year", year);

    const alumni = await query;

    res.json({ success: true, data: alumni });
  } catch (error) {
    console.error("Error searching alumni:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
