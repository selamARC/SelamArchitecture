const express = require('express');
const router  = express.Router();
const Job     = require('../models/Job');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/jobs
 * Public: Returns active job openings.
 */
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return res.json(jobs);
  } catch (err) {
    console.error('[jobs GET] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/jobs/all
 * Protected (Admin only): Returns all jobs including inactive.
 */
router.get('/all', requireAuth, async (req, res) => {
  try {
    const jobs = await Job.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json(jobs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/jobs
 * Protected (Admin only): Add new job posting.
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, department, location, type, description, deadline, isActive, order } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Job title is required.' });
    }

    const job = new Job({
      title,
      department: department || '',
      location: location || '',
      type: type || 'Full-time',
      description: description || '',
      deadline: deadline || '',
      isActive: isActive !== undefined ? isActive : true,
      order: Number(order) || 0,
    });

    await job.save();
    return res.status(201).json({ result: 'success', job });
  } catch (err) {
    console.error('[jobs POST] Error:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/jobs/:id
 * Protected (Admin only): Update job posting.
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Job not found.' });
    }
    return res.json({ result: 'success', job: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/jobs/:id
 * Protected (Admin only): Delete job posting.
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Job not found.' });
    }
    return res.json({ result: 'success', message: 'Job posting deleted.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
