const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');

// GET /api/categories
router.get('/', (req, res) => {
  res.json({ categories: store.categories });
});

// GET /api/categories/:slug/apps
router.get('/:slug/apps', (req, res) => {
  const { slug } = req.params;
  const { sort = 'installCount', limit = 20, page = 1 } = req.query;
  let apps = store.apps.filter(a => a.category === slug && a.status === 'approved');
  apps.sort((a, b) => (b[sort] || 0) - (a[sort] || 0));
  const start = (page - 1) * limit;
  res.json({ apps: apps.slice(start, start + Number(limit)), total: apps.length });
});

module.exports = router;
