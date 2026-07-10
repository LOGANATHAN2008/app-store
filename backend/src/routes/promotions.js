const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { getIO } = require('../services/socket');
const { authenticate, requireRole, ADMIN_ROLES } = require('../middleware/auth');

// Initialize ads if not present
if (!dataStore.ads) {
  dataStore.ads = {
    popupAd: {
      active: false,
      imageUrl: '',
      linkUrl: '',
      delaySeconds: 10
    },
    popupAds: []
  };
}

// GET /api/promotions — public (used on storefront for popup ads)
router.get('/', (req, res) => {
  if (!dataStore.ads.popupAds) {
    dataStore.ads.popupAds = [];
    if (dataStore.ads.popupAd && dataStore.ads.popupAd.imageUrl) {
      dataStore.ads.popupAds.push({ ...dataStore.ads.popupAd, id: 'legacy-1', name: 'Legacy Ad' });
    }
  }
  res.json(dataStore.ads);
});

// PUT /api/promotions — admin only
router.put('/', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  dataStore.ads = req.body;
  if (dataStore.saveStore) {
    dataStore.saveStore();
  }
  const io = getIO();
  if (io) {
    io.emit('ads:updated');
  }
  res.json(dataStore.ads);
});

module.exports = router;
