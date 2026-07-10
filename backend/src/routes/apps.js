const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { emitInstallCountUpdated } = require('../services/socket');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRole, ADMIN_ROLES, STAFF_AND_ADMIN_ROLES } = require('../middleware/auth');

// GET /api/apps - list all apps with filters (public)
router.get('/', (req, res) => {
  let { category, page = 1, limit = 20, sort = 'installCount', includeUnapproved = 'false' } = req.query;
  let apps = [...store.apps];

  if (includeUnapproved !== 'true') {
    apps = apps.filter(a => a.status === 'approved');
  }

  if (category && category !== 'all') apps = apps.filter(a => a.category === category);
  apps.sort((a, b) => (b[sort] || 0) - (a[sort] || 0));
  const start = (page - 1) * limit;
  const paginated = apps.slice(start, start + Number(limit));
  res.json({ apps: paginated, total: apps.length, page: Number(page), limit: Number(limit) });
});

// GET /api/apps/featured (public)
router.get('/featured', (req, res) => {
  const featured = store.apps.filter(a => a.isFeatured && a.status === 'approved').slice(0, 6);
  res.json({ apps: featured });
});

// GET /api/apps/top (public)
router.get('/top', (req, res) => {
  const { type = 'free', limit = 25, page = 1 } = req.query;
  let apps = [...store.apps].filter(a => a.status === 'approved');
  if (type === 'free') apps = apps.filter(a => a.price === 0);
  else if (type === 'paid') apps = apps.filter(a => a.price > 0);
  apps.sort((a, b) => b.installCount - a.installCount);
  const start = (page - 1) * limit;
  res.json({ apps: apps.slice(start, start + Number(limit)), total: apps.length });
});

// GET /api/apps/:id (public)
router.get('/:id', (req, res) => {
  const app = store.apps.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });

  const allReviews = store.reviews.filter(r => r.appId === req.params.id);

  let sizeStr = '45.2 MB';
  if (app.fileSize) {
    const bytes = app.fileSize;
    if (bytes > 1024 * 1024 * 1024) sizeStr = (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    else sizeStr = (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  } else {
    let hash = 0;
    const seedStr = app.id || app.name || 'app';
    for (let i = 0; i < seedStr.length; i++) hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    const fakeMB = Math.abs(hash % 1900) + 15;
    if (fakeMB > 1024) sizeStr = (fakeMB / 1024).toFixed(1) + ' GB';
    else sizeStr = fakeMB + ' MB';
  }
  app.displaySize = sizeStr;

  res.json({ app, reviews: allReviews.slice(0, 10) });
});

// POST /api/apps - create (staff+admin only)
router.post('/', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), (req, res) => {
  const app = {
    id: uuidv4(),
    ...req.body,
    installCount: 0,
    averageRating: 0,
    reviewCount: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (req.body.uploaderId) {
    const user = store.users.find(u => u.id === req.body.uploaderId);
    if (user) {
      app.uploaderName = user.name || user.email;
    }
  }

  store.apps.unshift(app);
  store.saveStore();

  try {
    const { getIO } = require('../services/socket');
    const io = getIO();
    if (io) {
      io.emit('app:submitted', app);
    }
  } catch (e) { console.error("Socket error on submit:", e); }

  res.status(201).json({ app });
});

// PUT /api/apps/:id — staff+admin only
router.put('/:id', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), (req, res) => {
  const idx = store.apps.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'App not found' });
  store.apps[idx] = { ...store.apps[idx], ...req.body, updatedAt: new Date().toISOString() };
  store.saveStore();
  res.json({ app: store.apps[idx] });
});

// DELETE /api/apps/:id — admin only
router.delete('/:id', authenticate, requireRole(...ADMIN_ROLES), async (req, res) => {
  const { id } = req.params;
  const idx = store.apps.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'App not found' });

  const app = store.apps[idx];

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      const filesToDelete = [];
      const getPath = (url) => {
        if (!url) return null;
        const base = supabaseUrl + '/storage/v1/object/public/app-images/';
        return url.includes(base) ? url.replace(base, '') : null;
      };

      if (app.iconUrl) filesToDelete.push(getPath(app.iconUrl));
      if (app.bannerUrl) filesToDelete.push(getPath(app.bannerUrl));
      if (app.screenshotUrls?.length) {
        app.screenshotUrls.forEach(url => filesToDelete.push(getPath(url)));
      }

      const validFiles = filesToDelete.filter(Boolean);
      if (validFiles.length > 0) {
        await supabase.storage.from('app-images').remove(validFiles);
      }
    } catch (err) {
      console.error('Supabase cleanup error during app deletion:', err);
    }
  }

  store.reviews = store.reviews.filter(r => r.appId !== id);
  store.apps.splice(idx, 1);
  store.saveStore();

  try {
    const { getIO } = require('../services/socket');
    const io = getIO();
    if (io) io.emit('app:deleted', { appId: id });
  } catch (_) { }

  res.json({ success: true, message: 'App and all files deleted' });
});

// GET /api/apps/:id/reviews (public)
router.get('/:id/reviews', (req, res) => {
  const reviews = store.reviews.filter(r => r.appId === req.params.id);
  res.json({ reviews, total: reviews.length });
});

// POST /api/apps/:id/reviews — any authenticated user
router.post('/:id/reviews', authenticate, (req, res) => {
  const app = store.apps.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });
  const review = { id: uuidv4(), appId: req.params.id, ...req.body, helpful: 0, createdAt: new Date().toISOString() };
  store.reviews.unshift(review);
  const appReviews = store.reviews.filter(r => r.appId === req.params.id);
  app.reviewCount = appReviews.length;
  app.averageRating = appReviews.reduce((s, r) => s + r.rating, 0) / appReviews.length;
  store.saveStore();
  try { const { emitNewReview } = require('../services/socket'); emitNewReview(req.params.id, review); } catch (_) { }
  res.status(201).json({ review });
});

// POST /api/apps/:id/install — any authenticated user
router.post('/:id/install', authenticate, (req, res) => {
  const app = store.apps.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });
  app.installCount++;
  try { emitInstallCountUpdated(req.params.id, app.installCount); } catch (_) { }
  res.json({ installCount: app.installCount });
});

// DELETE /api/apps/:id/install — any authenticated user
router.delete('/:id/install', authenticate, (req, res) => {
  const app = store.apps.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });
  if (app.installCount > 0) app.installCount--;
  res.json({ installCount: app.installCount });
});

// PUT /api/apps/:id/update — staff+admin only
router.put('/:id/update', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), (req, res) => {
  const app = store.apps.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });

  const { version, changelog, scheduledAt } = req.body;
  if (!app.versionHistory) app.versionHistory = [];

  if (scheduledAt) {
    app.scheduledAt = scheduledAt;
    app.pendingUpdate = { version, changelog };
  } else {
    app.versionHistory.push({ version: app.version, changelog: app.changelog || 'Previous version', pushedAt: app.updatedAt });
    app.version = version;
    app.changelog = changelog;
    app.updatedAt = new Date().toISOString();
    app.scheduledAt = null;

    store.saveStore();

    try {
      const { getIO } = require('../services/socket');
      const io = getIO();
      if (io) io.emit('app:update_pushed', { appId: app.id, version, changelog });
    } catch (_) { }
  }

  res.json({ app });
});

// GET /api/apps/:id/history — public
router.get('/:id/history', (req, res) => {
  const app = store.apps.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });
  res.json({ history: app.versionHistory || [] });
});

module.exports = router;
