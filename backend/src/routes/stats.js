const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { authenticate, requireRole, STAFF_AND_ADMIN_ROLES } = require('../middleware/auth');

// GET /api/stats/badges — staff+admin only (admin sidebar badges)
router.get('/badges', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), (req, res) => {
  const pendingApps = store.apps.filter(a => a.status === 'pending').length;
  const updateApps = store.apps.filter(a => a.pendingUpdate != null).length;
  const bannedUsers = store.users.filter(u => u.isBanned).length;
  const totalReviews = store.reviews.length;
  const flaggedReviews = store.reviews.filter(r => r.isFlagged).length;

  res.json({
    pendingApps,
    updateApps,
    bannedUsers,
    totalReviews,
    flaggedReviews
  });
});

module.exports = router;
