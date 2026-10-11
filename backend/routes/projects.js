const express = require('express');
const router  = express.Router();
const Project = require('../models/Project');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/projects
 * Public: Returns all projects sorted by `order` then `createdAt`.
 */
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({})
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return res.json(projects);
  } catch (err) {
    console.error('[projects GET] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/projects
 * Protected (Admin only): Create a new project.
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, category, location, year, description, imageurl, featured, order } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required.' });
    }

    const project = new Project({
      title,
      category: category || 'commercial',
      location: location || '',
      year: year || '',
      description: description || '',
      imageurl: imageurl || '',
      featured: featured || 'no',
      order: Number(order) || 0,
    });

    await project.save();
    return res.status(201).json({ result: 'success', project });
  } catch (err) {
    console.error('[projects POST] Error:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/projects/:id
 * Protected (Admin only): Update an existing project.
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.json({ result: 'success', project: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/projects/:id
 * Protected (Admin only): Delete a project by ID.
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.json({ result: 'success', message: 'Project deleted.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
