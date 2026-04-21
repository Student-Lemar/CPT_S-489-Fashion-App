const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { User, Profile } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const COOKIE = 'fashion_token';

function cookieOpts(maxAge) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  };
}

function makeToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, displayName: user.displayName, status: user.status },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password, displayName } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ error: 'Username already taken' });

    const passwordHash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();

    const user = await User.create({
      id,
      username,
      passwordHash,
      role: 'creator',
      status: 'active',
      displayName: displayName || username,
      reports: 0,
    });

    await Profile.create({
      id: crypto.randomUUID(),
      username,
      displayName: user.displayName,
      bio: '',
      avatarDataUrl: null,
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = makeToken(user);
    res.cookie(COOKIE, token, cookieOpts(7 * 24 * 60 * 60 * 1000));
    res.json({ username: user.username, role: user.role, displayName: user.displayName, status: user.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE, cookieOpts(0));
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.user.username } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended' });
    res.json({ username: user.username, role: user.role, displayName: user.displayName, status: user.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

module.exports = router;
