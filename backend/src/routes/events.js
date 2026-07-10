const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireRole, ADMIN_ROLES } = require('../middleware/auth');

// === ADMIN ROUTES ===

// Get all events
router.get('/', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  res.json({ events: store.events || [] });
});

// Create new event
router.post('/', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const { name, description, startTime, endTime, limit, categories, requireApproval, bannerUrl } = req.body;
  
  const newEvent = {
    id: `EVT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    name,
    description,
    startTime,
    endTime,
    limit: Number(limit) || 0,
    categories: categories || [],
    requireApproval: requireApproval !== false,
    bannerUrl: bannerUrl || 'https://picsum.photos/seed/eventbanner/1200/400',
    links: [],
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  if (!store.events) store.events = [];
  store.events.push(newEvent);
  store.saveStore();

  res.status(201).json({ message: 'Event created successfully', event: newEvent });
});

// Generate link for event
router.post('/:eventId/links', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const { eventId } = req.params;
  const event = (store.events || []).find(e => e.id === eventId);
  
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const token = uuidv4();
  const newLink = {
    id: uuidv4(),
    token,
    url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/event/dev-upload/${token}`,
    clicks: 0,
    submissions: 0,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  event.links = event.links || [];
  event.links.push(newLink);
  store.saveStore();

  res.status(201).json({ message: 'Link generated', link: newLink });
});

// Disable link
router.put('/:eventId/links/:linkId/disable', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const { eventId, linkId } = req.params;
  const event = (store.events || []).find(e => e.id === eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const link = event.links.find(l => l.id === linkId);
  if (!link) return res.status(404).json({ message: 'Link not found' });

  link.status = 'expired';
  store.saveStore();
  res.json({ message: 'Link disabled successfully', link });
});

// Get submissions (all or by event)
router.get('/submissions', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const { eventId } = req.query;
  let submissions = store.eventSubmissions || [];
  
  if (eventId) {
    submissions = submissions.filter(s => s.eventId === eventId);
  }

  res.json({ submissions });
});

// Approve submission
router.put('/submissions/:id/approve', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const { id } = req.params;
  if (!store.eventSubmissions) store.eventSubmissions = [];
  
  const submission = store.eventSubmissions.find(s => s.id === id);
  if (!submission) return res.status(404).json({ message: 'Submission not found' });

  submission.status = 'approved';
  
  // Publish to main apps store
  const newApp = {
    ...submission.appData,
    id: uuidv4(),
    status: 'approved',
    installCount: 0,
    averageRating: 0,
    reviewCount: 0,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.apps.push(newApp);
  
  // Update category count
  const cat = store.categories.find(c => c.id === newApp.category);
  if (cat) cat.appCount++;

  store.saveStore();

  res.json({ message: 'App approved successfully', app: newApp });
});

// Reject submission
router.put('/submissions/:id/reject', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!store.eventSubmissions) store.eventSubmissions = [];

  const submission = store.eventSubmissions.find(s => s.id === id);
  if (!submission) return res.status(404).json({ message: 'Submission not found' });

  submission.status = 'rejected';
  submission.rejectReason = reason || 'No reason provided';
  store.saveStore();

  res.json({ message: 'App rejected successfully', submission });
});


// === PUBLIC ROUTES ===

// Validate event link
router.get('/public/links/:token', (req, res) => {
  const { token } = req.params;
  
  let targetEvent = null;
  let targetLink = null;

  for (const event of (store.events || [])) {
    const link = (event.links || []).find(l => l.token === token);
    if (link) {
      targetEvent = event;
      targetLink = link;
      break;
    }
  }

  if (!targetEvent || !targetLink) {
    return res.status(404).json({ valid: false, message: 'Invalid event link' });
  }

  if (targetLink.status !== 'active' || targetEvent.status !== 'active') {
    return res.status(403).json({ valid: false, message: 'Event link expired' });
  }

  const now = new Date();
  if (new Date(targetEvent.endTime) < now) {
    return res.status(403).json({ valid: false, message: 'Event has ended' });
  }

  // Increment clicks
  targetLink.clicks++;
  store.saveStore();

  res.json({
    valid: true,
    event: {
      id: targetEvent.id,
      name: targetEvent.name,
      description: targetEvent.description,
      endTime: targetEvent.endTime,
      bannerUrl: targetEvent.bannerUrl,
      limit: targetEvent.limit,
      categories: targetEvent.categories
    }
  });
});

// Submit app via event link
router.post('/public/links/:token/submit', (req, res) => {
  const { token } = req.params;
  const appData = req.body; // App data (name, desc, icons, etc)

  let targetEvent = null;
  let targetLink = null;

  for (const event of (store.events || [])) {
    const link = (event.links || []).find(l => l.token === token);
    if (link) {
      targetEvent = event;
      targetLink = link;
      break;
    }
  }

  if (!targetEvent || !targetLink || targetLink.status !== 'active') {
    return res.status(403).json({ message: 'Invalid or expired event link' });
  }

  const now = new Date();
  if (new Date(targetEvent.endTime) < now) {
    return res.status(403).json({ message: 'Event has ended' });
  }

  if (targetEvent.limit > 0 && targetLink.submissions >= targetEvent.limit) {
    return res.status(403).json({ message: 'Upload limit reached for this link' });
  }

  const submission = {
    id: `SUB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    eventId: targetEvent.id,
    linkId: targetLink.id,
    appData: { ...appData },
    status: targetEvent.requireApproval ? 'pending' : 'approved',
    createdAt: new Date().toISOString()
  };

  if (!store.eventSubmissions) store.eventSubmissions = [];
  store.eventSubmissions.push(submission);
  
  targetLink.submissions++;

  if (!targetEvent.requireApproval) {
    // Auto publish
    const newApp = {
      ...appData,
      id: uuidv4(),
      status: 'approved',
      installCount: 0,
      averageRating: 0,
      reviewCount: 0,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.apps.push(newApp);
    const cat = store.categories.find(c => c.id === newApp.category);
    if (cat) cat.appCount++;
  }

  store.saveStore();

  res.status(201).json({ 
    message: 'Application Submitted Successfully', 
    submissionId: submission.id,
    status: submission.status
  });
});

module.exports = router;
