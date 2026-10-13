/**
 * SELAM CONSULTING — Express + MongoDB Backend
 * ---------------------------------------------------------------
 * Full API powering the public website and the secure Admin Portal:
 *
 *  Public:
 *   POST /api/contact         — save customer enquiry
 *   GET  /api/projects        — list all projects
 *   GET  /api/team            — list team members
 *   GET  /api/jobs            — list active job openings
 *
 *  Admin (Protected with JWT):
 *   POST /api/auth/login      — admin login
 *   GET  /api/auth/me         — verify admin session
 *   GET  /api/stats           — dashboard stats overview
 *   GET  /api/contact         — view all contact submissions
 *   DELETE /api/contact/:id   — delete submission
 *   POST /api/projects        — create project
 *   PUT  /api/projects/:id    — edit project
 *   DELETE /api/projects/:id  — delete project
 *   POST /api/team            — add team member
 *   PUT  /api/team/:id        — edit team member
 *   DELETE /api/team/:id      — remove team member
 *   GET  /api/jobs/all        — list all jobs
 *   POST /api/jobs            — add job posting
 *   PUT  /api/jobs/:id        — edit job posting
 *   DELETE /api/jobs/:id      — remove job posting
 * ---------------------------------------------------------------
 */

require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const { router: authRouter, ensureDefaultAdmin } = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any explicitly listed origin
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow all localhost / 127.0.0.1 origins on any port (development)
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('http://[::1]:')
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy: origin '${origin}' is not allowed.`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/stats',    require('./routes/stats'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/team',     require('./routes/team'));
app.use('/api/jobs',     require('./routes/jobs'));

// Health-check endpoint
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// 404 catch-all
app.use((_req, res) =>
  res.status(404).json({ error: 'Route not found.' })
);

// ─── MongoDB + Server Start ───────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('<username>')) {
  console.error(
    '\n❌  MONGODB_URI is not set or still contains a placeholder.\n' +
    '   Copy .env.example → .env and fill in your real connection string.\n'
  );
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅  Connected to MongoDB');
    // Ensure initial admin user exists
    await ensureDefaultAdmin();

    app.listen(PORT, () =>
      console.log(`🚀  Selam Consulting API running on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
