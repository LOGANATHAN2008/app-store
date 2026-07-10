const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { authenticate, requireRole, ADMIN_ROLES } = require('../middleware/auth');

// GET /api/settings — public read (needed for store name/branding on frontend)
router.get('/', (req, res) => {
  if (!store.settings) {
    store.settings = {
      storeName: 'Apple App Store',
      supportEmail: 'support.loga@gmail.com',
      twoFactorAuth: false,
      strictIpWhitelist: false
    };
  }
  res.json(store.settings);
});

// POST /api/settings — admin only (write)
router.post('/', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  store.settings = { ...store.settings, ...req.body };
  store.saveStore();
  res.json({ success: true, settings: store.settings });
});

// GET /api/settings/privacy — public (policy page)
router.get('/privacy', (req, res) => {
  res.json({
    lastUpdated: new Date().toISOString(),
    version: '2.1',
    sections: null
  });
});

module.exports = router;
