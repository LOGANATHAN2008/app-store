const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { getIo } = require('../services/socket');
const { authenticate, requireRole, ADMIN_ROLES } = require('../middleware/auth');

// GET /api/featured — public (used on storefront homepage)
router.get('/', (req, res) => {
  res.json(dataStore.featured || {
    heroCards: [],
    topFree: [],
    topPaid: [],
    editorsChoice: []
  });
});

// PUT /api/featured — admin only
router.put('/', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const { heroCards, topFree, topPaid, editorsChoice } = req.body;

  if (!dataStore.featured) {
    dataStore.featured = {};
  }

  if (heroCards) dataStore.featured.heroCards = heroCards;
  if (topFree) dataStore.featured.topFree = topFree;
  if (topPaid) dataStore.featured.topPaid = topPaid;
  if (editorsChoice) dataStore.featured.editorsChoice = editorsChoice;

  const io = getIo();
  if (io) {
    io.emit('featured:updated');
    io.emit('charts:updated');
  }

  if (dataStore.saveStore) {
    dataStore.saveStore();
  }

  res.json(dataStore.featured);
});

module.exports = router;
