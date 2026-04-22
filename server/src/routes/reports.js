const express = require("express");
const crypto = require("crypto");
const { Report } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// POST /api/reports
// Body: { type: 'post'|'board', contentId, contentLabel, reason }
router.post("/", async (req, res) => {
  const { type, contentId, contentLabel, reason } = req.body;
  if (!type || !contentId || !contentLabel || !reason) {
    return res.status(400).json({ error: "type, contentId, contentLabel, and reason are required" });
  }
  if (!["post", "board"].includes(type)) {
    return res.status(400).json({ error: "type must be 'post' or 'board'" });
  }
  if (reason.length > 255) {
    return res.status(400).json({ error: "reason must be 255 characters or fewer" });
  }

  try {
    // Prevent duplicate pending reports from the same user for the same content
    const existing = await Report.findOne({
      where: { contentId, posterUsername: req.user.username, status: "pending" },
    });
    if (existing) {
      return res.status(409).json({ error: "You have already reported this content." });
    }

    const report = await Report.create({
      id: crypto.randomUUID(),
      type,
      contentId,
      contentLabel,
      posterUsername: req.user.username,
      reason,
      status: "pending",
    });
    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

module.exports = router;
