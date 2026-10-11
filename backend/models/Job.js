const mongoose = require('mongoose');

/**
 * Job — mirrors the "Jobs" tab from Google Sheets.
 * Fields match the column headers (lowercase) used in the sheet.
 */
const jobSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    department:  { type: String, default: '', trim: true },
    location:    { type: String, default: '', trim: true },
    type:        { type: String, default: '', trim: true },       // e.g. Full-time, Part-time
    description: { type: String, default: '', trim: true },
    deadline:    { type: String, default: '', trim: true },       // kept as string (e.g. "30 Jul 2026")
    isActive:    { type: Boolean, default: true },
    order:       { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'jobs',
  }
);

module.exports = mongoose.model('Job', jobSchema);
