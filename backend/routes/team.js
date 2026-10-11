const express = require('express');
const router  = express.Router();
const TeamMember = require('../models/TeamMember');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/team
 * Public: Returns all team members sorted by department, order, and createdAt.
 */
router.get('/', async (req, res) => {
  try {
    const team = await TeamMember.find({})
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
 * Protected (Admin only): Add a new team member.
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, position, department, profession, yearsexperience, photo, order } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team member name is required.' });
    }

    const member = new TeamMember({
      name,
      position: position || '',
      department: department || 'Team',
      profession: profession || '',
      yearsexperience: yearsexperience || '',
      photo: photo || '',
      order: Number(order) || 0,
    });

    await member.save();
    return res.status(201).json({ result: 'success', member });
  } catch (err) {
    console.error('[team POST] Error:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/team/:id
 * Protected (Admin only): Update team member.
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Team member not found.' });
    }
    return res.json({ result: 'success', member: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/team/:id
 * Protected (Admin only): Delete team member.
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await TeamMember.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Team member not found.' });
    }
    return res.json({ result: 'success', message: 'Team member removed.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
