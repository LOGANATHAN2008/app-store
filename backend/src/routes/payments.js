const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, requireRole, ADMIN_ROLES } = require('../middleware/auth');

// POST /api/payments/create-order — requires auth (logged-in users only)
router.post('/create-order', authenticate, paymentController.createOrder);

// POST /api/payments/verify — requires auth
router.post('/verify', authenticate, paymentController.verifyPayment);

// POST /api/payments/webhook — public (called by payment gateway)
router.post('/webhook', express.json({ type: 'application/json' }), paymentController.webhook);

// GET /api/payments/transactions (Admin only)
router.get('/transactions', authenticate, requireRole(...ADMIN_ROLES), paymentController.getTransactions);

// GET /api/payments/history/:userId — requires auth; users can only view their own history
router.get('/history/:userId', authenticate, (req, res, next) => {
  // Allow admins to view any user's history; regular users can only see their own
  const isAdmin = ADMIN_ROLES.includes(req.user.role);
  if (!isAdmin && req.user.id !== req.params.userId) {
    return res.status(403).json({ error: 'Access denied. You may only view your own payment history.' });
  }
  next();
}, paymentController.getUserHistory);

module.exports = router;
