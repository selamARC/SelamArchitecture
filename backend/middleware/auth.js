const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'selam_consulting_secret_key_2026';

/**
 * Middleware to verify JWT token in Authorization header.
 * Expected format: Bearer <token>
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Token required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Middleware to verify that the authenticated user is a Super Admin (Owner).
 */
function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied. Super Admin (Owner) privileges required.' });
  }
  next();
}

module.exports = { requireAuth, requireSuperAdmin, JWT_SECRET };

