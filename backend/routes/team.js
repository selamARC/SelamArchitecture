const express = require('express');
const router  = express.Router();
const TeamMember = require('../models/TeamMember');
const User = require('../models/User');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

/**
 * GET /api/team
 * Public: Returns all team members sorted by department, order, and createdAt.
 * Populates linked user info (safe fields only) so Super Admin can display login status.
 */
router.get('/', async (req, res) => {
  try {
    const team = await TeamMember.find({})
      .populate('user', 'username email role createdAt')
      .sort({ department: 1, order: 1, createdAt: 1 })
      .lean();

    return res.json(team);
  } catch (err) {
    console.error('[team GET] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/team
 * Super Admin only: Add a new team member and provision login credentials if provided.
 * Body: { name, position, department, profession, yearsexperience, photo, order, email, password }
 */
router.post('/', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const {
      name,
      position,
      department,
      profession,
      yearsexperience,
      photo,
      order,
      email,
      password,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team member full name is required.' });
    }

    const cleanName = name.trim();
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPassword = password ? password.trim() : '';

    let linkedUser = null;

    // If email and password provided, provision an admin User account
    if (cleanEmail) {
      if (cleanPassword && cleanPassword.length < 6) {
        return res.status(400).json({ error: 'Login password must be at least 6 characters long.' });
      }

      // Check if user already exists with this email
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        if (cleanPassword) {
          existingUser.password = cleanPassword;
          await existingUser.save();
        }
        linkedUser = existingUser;
      } else if (cleanPassword) {
        // Generate a valid unique username
        let baseUsername = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '');
        if (!baseUsername) {
          baseUsername = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '');
        }
        if (!baseUsername) {
          baseUsername = 'staff';
        }
        let uniqueUsername = baseUsername;
        let suffix = 1;
        while (await User.findOne({ username: uniqueUsername })) {
          uniqueUsername = `${baseUsername}_${suffix++}`;
        }

        linkedUser = new User({
          username: uniqueUsername,
          email: cleanEmail,
          password: cleanPassword,
          role: 'admin',
        });
        await linkedUser.save();
        console.log(`👤 New Admin User provisioned for team member: ${cleanEmail}`);
      }
    }

    const member = new TeamMember({
      name: cleanName,
      position: (position || '').trim(),
      department: (department || 'Team').trim(),
      profession: (profession || '').trim(),
      yearsexperience: (yearsexperience || '').trim(),
      photo: (photo || '').trim(),
      order: Number(order) || 0,
      email: cleanEmail,
      user: linkedUser ? linkedUser._id : undefined,
    });

    await member.save();

    const populatedMember = await TeamMember.findById(member._id).populate('user', 'username email role createdAt');

    return res.status(201).json({
      result: 'success',
      member: populatedMember,
      message: linkedUser
        ? `Team member created and staff login account activated for ${cleanEmail}!`
        : 'Team member created successfully.',
    });
  } catch (err) {
    console.error('[team POST] Error:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/team/:id
 * Super Admin only: Update team member and update/reset login credentials.
 */
router.put('/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const {
      name,
      position,
      department,
      profession,
      yearsexperience,
      photo,
      order,
      email,
      password,
    } = req.body;

    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found.' });
    }

    if (name !== undefined) member.name = name.trim();
    if (position !== undefined) member.position = position.trim();
    if (department !== undefined) member.department = department.trim();
    if (profession !== undefined) member.profession = profession.trim();
    if (yearsexperience !== undefined) member.yearsexperience = yearsexperience.trim();
    if (photo !== undefined) member.photo = photo.trim();
    if (order !== undefined) member.order = Number(order) || 0;

    const cleanEmail = email !== undefined ? email.trim().toLowerCase() : member.email;
    const cleanPassword = password ? password.trim() : '';

    if (cleanPassword && cleanPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    // Handle linked user credential updates or provisioning
    if (cleanEmail) {
      let linkedUser = null;
      if (member.user) {
        linkedUser = await User.findById(member.user);
      }
      if (!linkedUser && member.email) {
        linkedUser = await User.findOne({ email: member.email });
      }

      if (linkedUser) {
        // Check if updating email to another existing user's email
        if (cleanEmail !== linkedUser.email) {
          const duplicate = await User.findOne({ email: cleanEmail, _id: { $ne: linkedUser._id } });
          if (duplicate) {
            return res.status(400).json({ error: `The email "${cleanEmail}" is already taken by another account.` });
          }
          linkedUser.email = cleanEmail;
        }

        if (cleanPassword) {
          linkedUser.password = cleanPassword; // Handled by pre('save') bcrypt hook
        }

        if (member.name && (!linkedUser.username || linkedUser.username === linkedUser.email.split('@')[0])) {
          linkedUser.username = member.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }

        await linkedUser.save();
        member.user = linkedUser._id;
      } else if (cleanPassword) {
        // Provision a new user if one didn't exist
        const duplicate = await User.findOne({ email: cleanEmail });
        if (duplicate) {
          member.user = duplicate._id;
        } else {
          let baseUsername = (member.name || 'member').toLowerCase().replace(/[^a-z0-9]/g, '_');
          let uniqueUsername = baseUsername;
          let suffix = 1;
          while (await User.findOne({ username: uniqueUsername })) {
            uniqueUsername = `${baseUsername}_${suffix++}`;
          }

          const newUser = new User({
            username: uniqueUsername,
            email: cleanEmail,
            password: cleanPassword,
            role: 'admin',
          });
          await newUser.save();
          member.user = newUser._id;
        }
      }
    }

    member.email = cleanEmail;
    await member.save();

    const populatedMember = await TeamMember.findById(member._id).populate('user', 'username email role createdAt');

    return res.json({
      result: 'success',
      member: populatedMember,
      message: 'Team member updated successfully.',
    });
  } catch (err) {
    console.error('[team PUT] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/team/:id
 * Super Admin only: Delete team member and revoke their admin login account.
 */
router.delete('/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found.' });
    }

    // Revoke linked user login access if it exists (protect superadmin account)
    if (member.user && member.user.toString() !== req.user.id.toString()) {
      const userDoc = await User.findById(member.user);
      if (userDoc && userDoc.role !== 'superadmin') {
        await User.findByIdAndDelete(member.user);
        console.log(`🗑 Revoked login account for user ${userDoc.email}`);
      }
    } else if (member.email) {
      const userDoc = await User.findOne({ email: member.email });
      if (userDoc && userDoc.role !== 'superadmin' && userDoc._id.toString() !== req.user.id.toString()) {
        await User.findByIdAndDelete(userDoc._id);
        console.log(`🗑 Revoked login account for user ${userDoc.email}`);
      }
    }

    await TeamMember.findByIdAndDelete(req.params.id);

    return res.json({
      result: 'success',
      message: `Team member "${member.name}" and login clearance removed.`,
    });
  } catch (err) {
    console.error('[team DELETE] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

