const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * authenticate — verifies the Authorization: Bearer <token> header.
 * On success attaches decoded payload to req.user.
 * On failure returns 401.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * requireRole(...roles) — middleware factory.
 * Returns 403 if req.user.role is not in the allowed list.
 * Must be used AFTER authenticate.
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
  }
  next();
};

// Convenience aliases
const ADMIN_ROLES = ['super_admin', 'admin'];
const STAFF_AND_ADMIN_ROLES = ['super_admin', 'admin', 'staff'];

module.exports = { authenticate, requireRole, ADMIN_ROLES, STAFF_AND_ADMIN_ROLES };
