const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { v4: uuidv4 } = require('uuid');

// GET all developer websites (Public)
router.get('/', (req, res) => {
  res.json({ websites: store.developerWebsites || [] });
});

// POST a new developer website (Admin only)
router.post('/', (req, res) => {
  const { name, url, iconUrl } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }

  const newWebsite = {
    id: uuidv4(),
    name,
    url,
    iconUrl: iconUrl || '',
    createdAt: new Date().toISOString()
  };

  store.developerWebsites = store.developerWebsites || [];
  store.developerWebsites.push(newWebsite);
  store.saveStore();

  res.status(201).json(newWebsite);
});

// DELETE a developer website (Admin only)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = store.developerWebsites.length;
  
  store.developerWebsites = store.developerWebsites.filter(w => w.id !== id);
  
  if (store.developerWebsites.length === initialLength) {
    return res.status(404).json({ error: 'Website not found' });
  }

  store.saveStore();
  res.json({ message: 'Website deleted successfully' });
});

module.exports = router;
