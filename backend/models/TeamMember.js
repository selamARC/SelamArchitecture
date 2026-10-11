const mongoose = require('mongoose');

/**
 * TeamMember — mirrors the "Team" tab from Google Sheets.
 * Fields match the column headers (lowercase) used in the sheet.
 */
const teamMemberSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    position:        { type: String, default: '', trim: true },
    department:      { type: String, default: 'Team', trim: true },
    profession:      { type: String, default: '', trim: true },
    yearsexperience: { type: String, default: '', trim: true },
    photo:           { type: String, default: '', trim: true }, // URL or Google Drive share link
    order:           { type: Number, default: 0 },             // display sort order within department
  },
  {
    timestamps: true,
    collection: 'team',
  }
);

module.exports = mongoose.model('TeamMember', teamMemberSchema);
