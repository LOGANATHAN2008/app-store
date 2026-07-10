const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { getIO } = require('../services/socket');
const { authenticate, requireRole, ADMIN_ROLES, STAFF_AND_ADMIN_ROLES } = require('../middleware/auth');

// All queue endpoints are staff+admin only (staff can view/act on queue)

// GET /api/admin/queue -> all apps, filtered by status
router.get('/', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), (req, res) => {
  const { status } = req.query;
  let apps = dataStore.apps;

  if (status) {
    apps = apps.filter(a => a.status === status);
  }

  res.json(apps);
});

// GET /api/admin/queue/stats
router.get('/stats', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), (req, res) => {
  const apps = dataStore.apps;
  const stats = {
    pending: apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
    inReview: apps.filter(a => a.status === 'review').length,
    flagged: apps.filter(a => a.status === 'flagged').length,
  };
  res.json(stats);
});

// PUT /api/admin/queue/:id/approve (staff+admin)
router.put('/:id/approve', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), (req, res) => {
  const { id } = req.params;
  const appIdx = dataStore.apps.findIndex(a => a.id === id);
  if (appIdx === -1) return res.status(404).json({ error: 'App not found' });

  const updatedApp = {
    ...dataStore.apps[appIdx],
    status: 'approved',
    publishedAt: new Date().toISOString()
  };
  delete updatedApp.scheduledAt;
  dataStore.apps[appIdx] = updatedApp;
  dataStore.saveStore();
  const io = getIO();
  if (io) {
    io.emit('app:approved', updatedApp);
    io.emit('app:new', updatedApp);
  }

  res.json(updatedApp);
});

// PUT /api/admin/queue/:id/reject (staff+admin)
router.put('/:id/reject', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const appIdx = dataStore.apps.findIndex(a => a.id === id);
  if (appIdx === -1) return res.status(404).json({ error: 'App not found' });

  const updatedApp = {
    ...dataStore.apps[appIdx],
    status: 'rejected',
    rejectionReason: reason
  };
  dataStore.apps[appIdx] = updatedApp;
  dataStore.saveStore();
  const io = getIO();
  if (io) io.emit('app:rejected', updatedApp);

  res.json(updatedApp);
});

// PUT /api/admin/queue/:id/hold (staff+admin)
router.put('/:id/hold', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const appIdx = dataStore.apps.findIndex(a => a.id === id);
  if (appIdx === -1) return res.status(404).json({ error: 'App not found' });

  const updatedApp = {
    ...dataStore.apps[appIdx],
    status: 'hold',
    holdReason: reason
  };
  dataStore.apps[appIdx] = updatedApp;
  dataStore.saveStore();
  const io = getIO();
  if (io) io.emit('app:updated', updatedApp);

  res.json(updatedApp);
});

// PUT /api/admin/queue/:id/schedule (staff+admin)
router.put('/:id/schedule', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  const appIdx = dataStore.apps.findIndex(a => a.id === id);
  if (appIdx === -1) return res.status(404).json({ error: 'App not found' });

  const updatedApp = {
    ...dataStore.apps[appIdx],
    status: 'scheduled',
    scheduledAt: date
  };
  dataStore.apps[appIdx] = updatedApp;
  dataStore.saveStore();
  const io = getIO();
  if (io) io.emit('app:updated', updatedApp);

  res.json(updatedApp);
});

module.exports = router;
