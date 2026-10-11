const mongoose = require('mongoose');

/**
 * Project — mirrors the "Projects" tab from Google Sheets.
 * Fields match the column headers used in the sheet (lowercase),
 * so any existing CSV data can be imported with minimal transformation.
 */
const projectSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    category:    { type: String, default: 'commercial', trim: true },
    location:    { type: String, default: '', trim: true },
    year:        { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    imageurl:    { type: String, default: '', trim: true },  // Google Drive URL or any image URL
    featured:    { type: String, default: 'no', trim: true }, // 'yes' | 'no'  (kept as string for compatibility)
    order:       { type: Number, default: 0 },               // display sort order
  },
  {
    timestamps: true,
    collection: 'projects',
  }
);

module.exports = mongoose.model('Project', projectSchema);
