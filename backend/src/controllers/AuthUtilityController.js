// src/controllers/AuthUtilityController.js
const knex = require("../config/db");
const bcrypt = require("bcrypt");
const {
  generateRandomToken,
  hashToken,
  verifyTokenHash,
} = require("../services/tokenService");
const { sendEmail } = require("../utils/emailService");
const RESET_TOKEN_EXPIRY_MINUTES = 60; // 1 hour

// POST /auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await knex("users").where({ email }).first();

    // Always respond with generic message
    if (!user) {
      return res.json({
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const plainToken = generateRandomToken();
    const tokenHash = hashToken(plainToken);
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );

    await knex("password_reset_tokens").insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used: false,
      created_at: new Date(),
    });

    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${plainToken}&uid=${user.id}`;

    try {
      await sendEmail(
        user.email,
        "Password Reset Request",
        `You requested a password reset. Click the link:\n\n${resetLink}\n\nThis link expires in ${RESET_TOKEN_EXPIRY_MINUTES} minutes.`
      );
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
    }

    return res.json({
      message: "If this email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("forgotPassword error", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { uid, token, newPassword } = req.body;
    if (!uid || !token || !newPassword) {
      return res
        .status(400)
        .json({ error: "uid, token and newPassword are required" });
    }

    const record = await knex("password_reset_tokens")
      .where({ user_id: uid, used: false })
      .andWhere("expires_at", ">", new Date())
      .orderBy("created_at", "desc")
      .first();

    if (!record)
      return res.status(400).json({ error: "Invalid or expired token" });

    const match = verifyTokenHash(token, record.token_hash);
    if (!match)
      return res.status(400).json({ error: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await knex("users").where({ id: uid }).update({ password: hashedPassword });

    await knex("password_reset_tokens")
      .where({ id: record.id })
      .update({ used: true });

    const user = await knex("users").where({ id: uid }).first();
    if (user) {
      try {
        await sendEmail(
          user.email,
          "Password Changed",
          "Your password has been changed. If this wasn’t you, contact support immediately."
        );
      } catch (e) {
        console.error("Notification email failed", e);
      }
    }

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("resetPassword error", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /auth/change-password (authenticated)
exports.changePassword = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Unauthorized" });
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "currentPassword and newPassword required" });
    }

    const user = await knex("users").where({ id: userId }).first();
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await knex("users")
      .where({ id: userId })
      .update({ password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error", err);
    return res.status(500).json({ error: "Server error" });
  }
};
