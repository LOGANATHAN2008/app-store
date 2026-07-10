const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { authenticate, requireRole, ADMIN_ROLES } = require('../middleware/auth');

// -----------------------------------------------------------------
// GET /api/users/me — returns the authenticated user's own profile.
// Safe for any logged-in role.
// -----------------------------------------------------------------
router.get('/me', authenticate, (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) {
    // Fall back to JWT payload if user not in store (e.g. hardcoded admin)
    return res.json({ user: req.user });
  }
  // Strip password before returning
  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
});

// -----------------------------------------------------------------
// All routes below require admin-level access.
// -----------------------------------------------------------------

// GET /api/users — list all users (admin only)
router.get('/', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  let { role, status, search = '' } = req.query;
  let result = [...store.users];

  if (role && role !== 'all') {
    result = result.filter(u => u.role === role);
  }
  if (status && status !== 'all') {
    result = result.filter(u => u.status === status);
  }
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(u =>
      (u.name || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s)
    );
  }

  // Strip passwords from the list
  const safeResult = result.map(({ password, ...u }) => u);
  res.json({ users: safeResult, total: safeResult.length });
});

// PUT /api/users/:id/status (admin only)
router.put('/:id/status', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.status = req.body.status;
  if (store.saveStore) store.saveStore();
  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
});

// PUT /api/users/:id/role (admin only)
router.put('/:id/role', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.role = req.body.role;
  if (store.saveStore) store.saveStore();
  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
});

// DELETE /api/users/:id (admin only)
router.delete('/:id', authenticate, requireRole(...ADMIN_ROLES), (req, res) => {
  const index = store.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  store.users.splice(index, 1);
  if (store.saveStore) store.saveStore();
  res.json({ success: true });
});

// POST /api/users/staff — add staff member (admin only)
router.post('/staff', authenticate, requireRole(...ADMIN_ROLES), async (req, res) => {
  const { v4: uuidv4 } = require('uuid');
  const bcrypt = require('bcryptjs');
  const { name, email, role, phone, password } = req.body;

  if (!name || (!email && !phone) || !password) {
    return res.status(400).json({ error: 'Name, Email/Phone, and Password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newStaff = {
    id: uuidv4(),
    name,
    email: email || '',
    phone: phone || '',
    password: hashedPassword,
    role: role || 'staff',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: null,
    avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
  };

  store.users.unshift(newStaff);
  if (store.saveStore) store.saveStore();

  const { password: _pw, ...safeStaff } = newStaff;
  res.status(201).json({ user: safeStaff });
});

module.exports = router;
