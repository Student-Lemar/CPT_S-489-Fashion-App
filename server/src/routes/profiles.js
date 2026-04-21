const express = require('express');
const { Profile } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/profiles/:username (public)
router.get('/:username', async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { username: req.params.username } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /api/profiles/:username (must be own profile)
router.put('/:username', authenticate, async (req, res) => {
  if (req.user.username !== req.params.username && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const profile = await Profile.findOne({ where: { username: req.params.username } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const allowed = ['displayName', 'bio', 'email', 'avatarDataUrl'];
    allowed.forEach((k) => { if (req.body[k] !== undefined) profile[k] = req.body[k]; });
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
