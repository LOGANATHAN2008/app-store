const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');

// GET /api/search?q=
router.get('/', (req, res) => {
  const { q = '', category, limit = 20 } = req.query;
  if (!q.trim()) return res.json({ apps: [], total: 0 });
  const query = q.toLowerCase();
  let results = store.apps.filter(a =>
    a.status === 'approved' && (
    a.name.toLowerCase().includes(query) ||
    a.developer.toLowerCase().includes(query) ||
    a.shortDescription.toLowerCase().includes(query) ||
    (a.tags || []).some(t => t.toLowerCase().includes(query))
    )
  );
  if (category && category !== 'all') results = results.filter(a => a.category === category);
  results.sort((a, b) => b.installCount - a.installCount);

  // Record search in history
  if (query.length >= 2) {
    if (!store.searchHistory) store.searchHistory = [];
    const existing = store.searchHistory.find(s => s.query === query);
    if (existing) {
      existing.count += 1;
      existing.lastSearched = new Date().toISOString();
    } else {
      store.searchHistory.push({ query, count: 1, lastSearched: new Date().toISOString() });
    }
    // Note: We don't saveStore() here to avoid excessive disk I/O on every search. 
    // It will be saved eventually on other write operations or server shutdown.
  }

  res.json({ apps: results.slice(0, Number(limit)), total: results.length });
});

// GET /api/search/trending
router.get('/trending', (req, res) => {
  // If no search history or not enough data, use fallbacks
  let trending = [];
  if (store.searchHistory && store.searchHistory.length > 0) {
    // Sort by count descending, get top 12
    trending = [...store.searchHistory]
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
      .map(s => s.query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')); // Capitalize
  }

  // Fallback array if no history yet
  if (trending.length < 5) {
    const fallbacks = [
      'Photo Editor', 'AI Assistant', 'Fitness Tracker', 'Music Player',
      'Language Learning', 'Meditation', 'Password Manager', 'VPN',
      'Video Editor', 'Budget Planner', 'Recipe App', 'Workout Tracker',
    ];
    trending = [...new Set([...trending, ...fallbacks])].slice(0, 12);
  }

  const trendingApps = store.apps
    .filter(a => a.status === 'approved')
    .sort((a, b) => b.installCount - a.installCount)
    .slice(0, 12)
    .map(a => ({ id: a.id, name: a.name, category: a.category, iconUrl: a.iconUrl }));
    
  res.json({ trending, trendingApps });
});

module.exports = router;
