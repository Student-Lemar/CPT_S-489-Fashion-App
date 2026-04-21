const express = require("express");
const crypto = require("crypto");
const { User, Report, AuditLogEntry } = require("../models");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, requireAdmin);

async function logAction(adminUsername, action, target) {
  await AuditLogEntry.create({
    id: crypto.randomUUID(),
    adminUsername,
    action,
    target,
    timestamp: new Date(),
  });
}

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({ order: [["username", "ASC"]] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to list users" });
  }
});

// POST /api/admin/users/:username/toggle-status
router.post("/users/:username/toggle-status", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const newStatus = user.status === "active" ? "suspended" : "active";
    user.status = newStatus;
    await user.save();
    await logAction(
      req.user.username,
      newStatus === "suspended" ? "SUSPEND_USER" : "REACTIVATE_USER",
      req.params.username,
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle user status" });
  }
});

// GET /api/admin/reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.findAll({ order: [["createdAt", "DESC"]] });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to list reports" });
  }
});

// PUT /api/admin/reports/:id
router.put("/reports/:id", async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    report.status = req.body.status || report.status;
    await report.save();
    await logAction(
      req.user.username,
      `UPDATE_REPORT_${report.status.toUpperCase()}`,
      report.id,
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

// POST /api/admin/users/:username/warn
router.post("/users/:username/warn", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.reports = (user.reports || 0) + 1;
    await user.save();
    await logAction(req.user.username, "WARN_USER", req.params.username);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to warn user" });
  }
});

// GET /api/admin/audit-log
router.get("/audit-log", async (req, res) => {
  try {
    const log = await AuditLogEntry.findAll({
      order: [["timestamp", "DESC"]],
      limit: 100,
    });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: "Failed to get audit log" });
  }
});

module.exports = router;
