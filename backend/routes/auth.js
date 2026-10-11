const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

/**
 * Ensures at least one admin exists in the database.
 * If none exists, creates the default admin user.
 */
async function ensureDefaultAdmin() {
  const count = await User.countDocuments();
  if (count === 0) {
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@selam.com';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const defaultUsername = 'admin';

    const admin = new User({
      username: defaultUsername,
      email: defaultEmail,
      password: defaultPassword,
      role: 'admin',
    });
    await admin.save();
    console.log(`🔑 Initial admin account created: ${defaultEmail} / [password from env or default 'admin123']`);
  }
}

/**
 * POST /api/auth/login
 * Body: { email or username, password }
 */
router.post('/login', async (req, res) => {
  try {
    await ensureDefaultAdmin();

    const { identifier, email, username, password } = req.body;
    const loginId = (identifier || email || username || '').trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Please provide email/username and password.' });
    }

    const user = await User.findOne({
      $or: [{ email: loginId }, { username: loginId }],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      result: 'success',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[auth/login] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/me
 * Checks if current token is valid and returns user info
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = { router, ensureDefaultAdmin };
