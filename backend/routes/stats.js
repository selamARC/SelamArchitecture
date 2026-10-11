const express = require('express');
const router  = express.Router();
const Submission = require('../models/Submission');
const Project    = require('../models/Project');
const TeamMember = require('../models/TeamMember');
const Job        = require('../models/Job');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/stats
 * Protected (Admin only): Aggregated statistics and summary for dashboard.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const [
      submissionCount,
      projectCount,
      teamCount,
      jobCount,
      recentSubmissions,
    ] = await Promise.all([
      Submission.countDocuments(),
      Project.countDocuments(),
      TeamMember.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Submission.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return res.json({
      counts: {
        submissions: submissionCount,
        projects: projectCount,
        team: teamCount,
        jobs: jobCount,
      },
      recentSubmissions,
    });
  } catch (err) {
    console.error('[stats route] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
