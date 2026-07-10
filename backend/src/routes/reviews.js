const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { authenticate, requireRole, ADMIN_ROLES } = require('../middleware/auth');

// Seed reviews if empty
if (store.reviews.length === 0) {
  const { v4: uuidv4 } = require('uuid');
  const dummyTexts = [
    "Amazing app, I use it every day!",
    "It crashes sometimes but overall very good.",
    "Completely useless, do not download.",
    "Best radio app out there, crystal clear sound.",
    "Why does this app need so many permissions?",
    "Perfect for my daily workflow.",
    "SCAM APP! Stole my money! DO NOT USE!!!",
    "I wish it had a dark mode, but otherwise 5 stars."
  ];

  store.reviews = Array.from({ length: 20 }).map((_, i) => ({
    id: uuidv4(),
    appId: store.apps[i % store.apps.length]?.id || 'unknown',
    appName: store.apps[i % store.apps.length]?.name || 'Unknown App',
    userId: `user-${i}`,
    userName: `Store User ${i + 1}`,
    rating: Math.floor(Math.random() * 5) + 1,
    text: dummyTexts[i % dummyTexts.length],
    isFlagged: (i % dummyTexts.length) === 6 || (i % dummyTexts.length) === 4,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
  }));
}

// GET /api/reviews — admin only (admin review moderation panel)
router.get('/', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  let { status, search = '' } = req.query;
  let result = [...store.reviews];

  if (status === 'flagged') {
    result = result.filter(r => r.isFlagged);
  }

  if (search) {
    const s = search.toLowerCase();
    result = result.filter(r => {
      const text = r.text || r.body || '';
      const appName = r.appName || '';
      return text.toLowerCase().includes(s) || appName.toLowerCase().includes(s);
    });
  }

  res.json({ reviews: result, total: result.length });
});

// PUT /api/reviews/:id/unflag — admin only
router.put('/:id/unflag', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const review = store.reviews.find(r => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  review.isFlagged = false;
  res.json({ review });
});

// DELETE /api/reviews/:id — admin only
router.delete('/:id', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const index = store.reviews.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Review not found' });

  store.reviews.splice(index, 1);
  res.json({ success: true });
});

module.exports = router;
