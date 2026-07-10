const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRole, ADMIN_ROLES } = require('../middleware/auth');

// === PUBLIC ROUTES ===

// Get all upcoming apps for the launchpad
router.get('/', (req, res) => {
  const apps = store.launchpadApps || [];
  
  // Clean up private data for public facing
  const publicApps = apps.map(app => ({
    id: app.id,
    name: app.name,
    developer: app.developer,
    shortDescription: app.shortDescription,
    description: app.description,
    iconUrl: app.iconUrl,
    bannerUrl: app.bannerUrl,
    category: app.category,
    launchDate: app.launchDate,
    votes: app.votes || 0,
    notifyCount: (app.notifyEmails || []).length,
    status: app.status
  }));

  // Sort by launch date ascending (closest first), or by votes if requested
  const sort = req.query.sort || 'date';
  if (sort === 'votes') {
    publicApps.sort((a, b) => b.votes - a.votes);
  } else {
    publicApps.sort((a, b) => new Date(a.launchDate) - new Date(b.launchDate));
  }

  res.json({ apps: publicApps });
});

// Vote (Product Hunt Style)
router.post('/:id/vote', (req, res) => {
  const { id } = req.params;
  const apps = store.launchpadApps || [];
  const app = apps.find(a => a.id === id);

  if (!app) return res.status(404).json({ message: 'App not found on Launchpad' });
  
  app.votes = (app.votes || 0) + 1;
  store.saveStore();

  res.json({ message: 'Vote registered!', votes: app.votes });
});

// Notify Me
router.post('/:id/notify', (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Valid email required' });
  }

  const apps = store.launchpadApps || [];
  const app = apps.find(a => a.id === id);

  if (!app) return res.status(404).json({ message: 'App not found on Launchpad' });

  app.notifyEmails = app.notifyEmails || [];
  if (!app.notifyEmails.includes(email)) {
    app.notifyEmails.push(email);
    store.saveStore();
  }

  res.json({ message: 'You will be notified on launch day!' });
});


// === ADMIN ROUTES ===

// Add new app to launchpad
router.post('/', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const { name, developer, shortDescription, description, category, launchDate, iconUrl, bannerUrl } = req.body;

  if (!store.launchpadApps) store.launchpadApps = [];

  const newApp = {
    id: `LP-${uuidv4().substring(0,8)}`,
    name,
    developer,
    shortDescription,
    description,
    category,
    launchDate,
    iconUrl,
    bannerUrl,
    votes: 0,
    notifyEmails: [],
    status: 'upcoming',
    createdAt: new Date().toISOString()
  };

  store.launchpadApps.push(newApp);
  store.saveStore();

  res.status(201).json({ message: 'App added to Launchpad', app: newApp });
});

// Launch app (Move to main store)
router.post('/:id/launch', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const { id } = req.params;
  const apps = store.launchpadApps || [];
  const appIndex = apps.findIndex(a => a.id === id);

  if (appIndex === -1) return res.status(404).json({ message: 'App not found' });

  const app = apps[appIndex];
  
  // Move to main store apps
  const newApp = {
    id: uuidv4(),
    name: app.name,
    developer: app.developer,
    shortDescription: app.shortDescription,
    description: app.description,
    category: app.category,
    iconUrl: app.iconUrl,
    bannerUrl: app.bannerUrl,
    downloadUrl: '', // To be updated by admin later
    screenshotUrls: [],
    status: 'approved',
    installCount: 0,
    averageRating: 0,
    reviewCount: 0,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    launchedFromPad: true,
    initialVotes: app.votes
  };

  store.apps.push(newApp);
  
  const cat = store.categories.find(c => c.id === newApp.category);
  if (cat) cat.appCount++;

  // Mark as launched in launchpad
  app.status = 'launched';
  store.saveStore();

  res.json({ message: 'App launched successfully!', app: newApp });
});

// Delete from launchpad
router.delete('/:id', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const { id } = req.params;
  if (!store.launchpadApps) store.launchpadApps = [];
  
  const initLength = store.launchpadApps.length;
  store.launchpadApps = store.launchpadApps.filter(a => a.id !== id);
  
  if (store.launchpadApps.length === initLength) {
    return res.status(404).json({ message: 'App not found' });
  }

  store.saveStore();
  res.json({ message: 'Removed from Launchpad' });
});

module.exports = router;
