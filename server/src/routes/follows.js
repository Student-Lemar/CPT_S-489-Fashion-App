const express = require("express");
const { Follow } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

async function getStatus(follower, followed) {
  const row = follower
    ? await Follow.findOne({
        where: { followerUsername: follower, followedUsername: followed },
      })
    : null;
  const count = await Follow.count({ where: { followedUsername: followed } });
  return { following: !!row, followerCount: count };
}

// GET /api/follows/:username/status
router.get("/:username/status", authenticate, async (req, res) => {
  try {
    const status = await getStatus(req.user.username, req.params.username);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: "Failed to get follow status" });
  }
});

// POST /api/follows/:username (follow)
router.post("/:username", authenticate, async (req, res) => {
  // BR-07: cannot follow self
  if (req.user.username === req.params.username) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }
  try {
    await Follow.findOrCreate({
      where: {
        followerUsername: req.user.username,
        followedUsername: req.params.username,
      },
    });
    const status = await getStatus(req.user.username, req.params.username);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: "Failed to follow" });
  }
});

// DELETE /api/follows/:username (unfollow)
router.delete("/:username", authenticate, async (req, res) => {
  try {
    await Follow.destroy({
      where: {
        followerUsername: req.user.username,
        followedUsername: req.params.username,
      },
    });
    const status = await getStatus(req.user.username, req.params.username);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: "Failed to unfollow" });
  }
});

module.exports = router;
