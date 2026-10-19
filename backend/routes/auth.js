const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const TeamMember = require('../models/TeamMember');
const { requireAuth, requireSuperAdmin, JWT_SECRET } = require('../middleware/auth');

/**
 * Ensures at least one superadmin (owner) exists in the database.
 * If none exists, creates the default superadmin or promotes the initial user.
 */
async function ensureDefaultAdmin() {
  const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@selam.com').trim().toLowerCase();
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const defaultUsername = 'admin';

  // Check if any superadmin already exists
  const superAdminCount = await User.countDocuments({ role: 'superadmin' });
  if (superAdminCount > 0) return;

  // Check if the default admin user exists
  const existingUser = await User.findOne({
    $or: [{ email: defaultEmail }, { username: defaultUsername }]
  });

  if (existingUser) {
    existingUser.role = 'superadmin';
    await existingUser.save();
    console.log(`👑 Existing account upgraded to Super Admin (Owner): ${existingUser.email}`);
  } else {
    const superAdmin = new User({
      username: defaultUsername,
      email: defaultEmail,
      password: defaultPassword,
      role: 'superadmin',
    });
    await superAdmin.save();
    console.log(`👑 Initial Super Admin (Owner) created: ${defaultEmail} / [password from env or default 'admin123']`);
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

/**
 * GET /api/auth/users
 * Super Admin only: List all team admin users
 */
router.get('/users', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (err) {
    console.error('[auth/users] Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/users
 * Super Admin only: Create a new team admin member
 * Body: { email, password, username, role }
 */
router.post('/users', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Default username to email name portion if not supplied
    let cleanUsername = (username || '').trim();
    if (!cleanUsername) {
      cleanUsername = cleanEmail.split('@')[0];
    }

    // Check for existing user
    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }]
    });

    if (existing) {
      if (existing.email === cleanEmail) {
        return res.status(400).json({ error: 'An admin with this email already exists.' });
      }
      return res.status(400).json({ error: 'An admin with this username already exists. Please choose a different username.' });
    }

    const targetRole = role === 'superadmin' ? 'superadmin' : 'admin';

    const newUser = new User({
      username: cleanUsername,
      email: cleanEmail,
      password: cleanPassword,
      role: targetRole,
    });

    await newUser.save();

    return res.status(201).json({
      result: 'success',
      message: 'Team admin member created successfully.',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      }
    });
  } catch (err) {
    console.error('[auth/users] Create error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/auth/users/:id
 * Super Admin only: Update admin account details (username, email, password, role)
 */
router.put('/users/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const targetId = req.params.id;
    const { email, password, username, role } = req.body;

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Email change
    if (email && email.trim().toLowerCase() !== user.email) {
      const cleanEmail = email.trim().toLowerCase();
      const duplicate = await User.findOne({ email: cleanEmail, _id: { $ne: targetId } });
      if (duplicate) {
        return res.status(400).json({ error: `The email "${cleanEmail}" is already taken.` });
      }
      user.email = cleanEmail;
      // Also update linked TeamMember doc if any
      await TeamMember.updateMany({ user: targetId }, { email: cleanEmail });
    }

    // Username change
    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUsername = username.trim().toLowerCase();
      const duplicate = await User.findOne({ username: cleanUsername, _id: { $ne: targetId } });
      if (duplicate) {
        return res.status(400).json({ error: `The username "${cleanUsername}" is already taken.` });
      }
      user.username = cleanUsername;
    }

    // Password change
    if (password && password.trim()) {
      const cleanPassword = password.trim();
      if (cleanPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
      user.password = cleanPassword; // Pre-save hook will hash it
    }

    // Role change
    if (role && role !== user.role) {
      if (req.user.id === targetId && role !== 'superadmin') {
        return res.status(400).json({ error: 'You cannot revoke your own Super Admin access.' });
      }
      user.role = role === 'superadmin' ? 'superadmin' : 'admin';
    }

    await user.save();

    return res.json({
      result: 'success',
      message: `Account for ${user.email} updated successfully.`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[auth/users PUT] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/auth/users/:id
 * Super Admin only: Remove a team admin member
 */
router.delete('/users/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const targetId = req.params.id;

    // Prevent deleting self
    if (req.user.id === targetId) {
      return res.status(400).json({ error: 'You cannot delete your own Super Admin account.' });
    }

    const userToDelete = await User.findById(targetId);
    if (!userToDelete) {
      return res.status(404).json({ error: 'Team member account not found.' });
    }

    await User.findByIdAndDelete(targetId);

    return res.json({
      result: 'success',
      message: `Account for ${userToDelete.email} has been removed.`,
    });
  } catch (err) {
    console.error('[auth/users] Delete error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = { router, ensureDefaultAdmin };

