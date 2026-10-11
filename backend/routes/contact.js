const express = require('express');
const router  = express.Router();
const Submission = require('../models/Submission');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/contact
 * Public endpoint: Accepts contact form submissions from website visitors.
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !service || !message) {
      return res.status(400).json({
        result: 'error',
        message: 'Fields name, email, service and message are required.',
      });
    }

    const submission = new Submission({ name, email, phone, service, message });
    await submission.save();

    return res.status(201).json({ result: 'success' });
  } catch (err) {
    console.error('[contact POST] Error:', err.message);
    return res.status(500).json({ result: 'error', message: err.message });
  }
});

/**
 * GET /api/contact
 * Protected (Admin only): Returns all submissions, newest first.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json(submissions);
  } catch (err) {
    console.error('[contact GET] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/contact/:id
 * Protected (Admin only): Deletes a submission by ID.
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Submission.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    return res.json({ result: 'success', message: 'Submission deleted.' });
  } catch (err) {
    console.error('[contact DELETE] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
