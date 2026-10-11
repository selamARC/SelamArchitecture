const mongoose = require('mongoose');

/**
 * Submission — stores every contact form enquiry.
 * Maps 1-to-1 with what the old Google Apps Script appended
 * to the "Submissions" tab: timestamp, name, email, phone, service, message.
 */
const submissionSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, default: '', trim: true },
    service: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,   // adds createdAt + updatedAt automatically
    collection: 'submissions',
  }
);

module.exports = mongoose.model('Submission', submissionSchema);
