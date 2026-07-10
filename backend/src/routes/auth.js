const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

const store = require('../services/dataStore');

// Default backup admin in case data.json is completely empty
const ADMIN = { id: 'admin-001', email: 'admin@appstore.com', password: bcrypt.hashSync('admin123', 10), role: 'super_admin', name: 'Admin User' };

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email/Phone and password required' });
  
  // Search for user in persistent store by email or phone
  let foundUser = store.users.find(u => u.email === email || u.phone === email);
  let validPassword = false;

  // Fallback to hardcoded admin if it's the exact dev admin
  if (!foundUser && email === ADMIN.email) {
    foundUser = ADMIN;
  }

  if (!foundUser) return res.status(401).json({ error: 'Invalid credentials' });

  // Compare passwords
  validPassword = await bcrypt.compare(password, foundUser.password);
  
  if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
  
  if (foundUser.status === 'banned') return res.status(403).json({ error: 'Account suspended' });

  const token = jwt.sign(
    { id: foundUser.id, email: foundUser.email, role: foundUser.role, isAdmin: foundUser.role !== 'user' }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
  
  res.json({ token, user: { id: foundUser.id, email: foundUser.email, displayName: foundUser.name, picture: foundUser.picture, role: foundUser.role, isAdmin: foundUser.role !== 'user' } });
});

// POST /api/auth/google
router.post('/google', (req, res) => {
  const { email, displayName, roleReq, picture } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  let foundUser = store.users.find(u => u.email === email);

  // Google sign-in always respects the existing role in the store.
  // roleReq: 'admin' is no longer supported (removed with the PIN flow).
  // Staff must be pre-registered by an admin; they log in via their stored role.
  if (roleReq === 'staff') {
    if (!foundUser || foundUser.role !== 'staff') {
      return res.status(403).json({ error: 'Access Denied. Your email is not registered as Staff by the Admin.' });
    }
  } else {
    // Default: create or update as regular user; existing admins keep their stored role
    if (!foundUser) {
      const { v4: uuidv4 } = require('uuid');
      foundUser = {
        id: uuidv4(),
        email,
        name: displayName,
        picture: picture,
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      store.users.push(foundUser);
      store.saveStore();
    } else {
      // Update picture if missing or changed (do NOT change role)
      if (picture && foundUser.picture !== picture) {
        foundUser.picture = picture;
        store.saveStore();
      }
    }
  }


  if (foundUser?.status === 'banned') return res.status(403).json({ error: 'Account suspended' });

  const token = jwt.sign(
    { id: foundUser.id, email: foundUser.email, role: foundUser.role, isAdmin: foundUser.role !== 'user' }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
  
  res.json({ token, user: { id: foundUser.id, email: foundUser.email, displayName: foundUser.name, picture: foundUser.picture, role: foundUser.role, isAdmin: foundUser.role !== 'user' } });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

// GET /api/auth/me — returns the authenticated user's full profile from the store
router.get('/me', authenticate, (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) {
    // Fallback: return JWT payload (e.g. hardcoded admin)
    return res.json({ user: req.user });
  }
  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
});

// POST /api/auth/register (For Users)
router.post('/register', async (req, res) => {
  const { email, password, name, roleReq } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  if (store.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const { v4: uuidv4 } = require('uuid');
  const foundUser = {
    id: uuidv4(),
    email,
    password: bcrypt.hashSync(password, 10),
    name: name || email.split('@')[0],
    role: 'user', // registration always creates a plain user; admins are created by existing admins only
    status: 'active',
    createdAt: new Date().toISOString()
  };

  store.users.push(foundUser);
  store.saveStore();

  const token = jwt.sign(
    { id: foundUser.id, email: foundUser.email, role: foundUser.role, isAdmin: foundUser.role !== 'user' }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
  
  res.json({ token, user: { id: foundUser.id, email: foundUser.email, displayName: foundUser.name, role: foundUser.role, isAdmin: foundUser.role !== 'user' } });
});

// POST /api/auth/verify-pin
router.post('/verify-pin', authenticate, (req, res) => {
  const { pin } = req.body;
  const adminPin = process.env.ADMIN_PIN || '1453';
  if (pin === adminPin) {
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'Invalid Secure Password' });
});

module.exports = router;
