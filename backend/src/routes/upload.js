const express = require('express');
const router = require('express').Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
const { authenticate, requireRole, STAFF_AND_ADMIN_ROLES } = require('../middleware/auth');

// Initialize Supabase Client using env variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Use memory storage for direct upload to Supabase, but fallback to local if Supabase is missing
const useSupabase = !!supabase;
const uploadDir = path.join(__dirname, '../../uploads');

if (!useSupabase) {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  ['icons', 'screenshots', 'banners', 'apks'].forEach(d => {
    const p = path.join(uploadDir, d);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  });
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit to accommodate APKs
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.originalname.endsWith('.apk') || file.originalname.endsWith('.ipa')) cb(null, true);
    else cb(new Error('Only images, videos, APKs, and IPAs allowed'));
  },
});

let bucketCreated = false;

const uploadToSupabase = async (file, folder) => {
  if (!bucketCreated) {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets && !buckets.some(b => b.name === 'app-images')) {
      await supabase.storage.createBucket('app-images', { public: true });
      console.log('Automatically created app-images bucket in Supabase');
    }
    bucketCreated = true;
  }

  let ext = path.extname(file.originalname);
  if (folder === 'apks' && ext !== '.apk' && ext !== '.ipa') ext = '.apk';
  const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
  const { data, error } = await supabase.storage
    .from('app-images')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false, // NEVER overwrite existing files to prevent accidental deletion
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('app-images')
    .getPublicUrl(filename);
    
  return publicUrl;
};

// Fallback logic for saving locally
const saveLocally = (file, folder) => {
  let ext = path.extname(file.originalname);
  if (folder === 'apks' && ext !== '.apk' && ext !== '.ipa') ext = '.apk';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const dest = path.join(uploadDir, folder, filename);
  fs.writeFileSync(dest, file.buffer);
  const BASE_URL = `http://localhost:${process.env.PORT || 3001}`;
  return `${BASE_URL}/uploads/${folder}/${filename}`;
};

router.post('/icon', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), upload.single('icon'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  try {
    if (useSupabase) {
      const url = await uploadToSupabase(req.file, 'icons');
      return res.json({ url });
    } else {
      const url = saveLocally(req.file, 'icons');
      return res.json({ url });
    }
  } catch (error) {
    console.error("Icon upload error:", error);
    res.status(500).json({ error: 'Failed to upload icon' });
  }
});

router.post('/screenshots', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), upload.array('screenshots', 10), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });
  
  try {
    const urls = [];
    for (const file of req.files) {
      if (useSupabase) {
        urls.push(await uploadToSupabase(file, 'screenshots'));
      } else {
        urls.push(saveLocally(file, 'screenshots'));
      }
    }
    res.json({ urls });
  } catch (error) {
    console.error("Screenshots upload error:", error);
    res.status(500).json({ error: 'Failed to upload screenshots' });
  }
});

router.post('/banner', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), upload.single('banner'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  try {
    if (useSupabase) {
      const url = await uploadToSupabase(req.file, 'banners');
      return res.json({ url });
    } else {
      const url = saveLocally(req.file, 'banners');
      return res.json({ url });
    }
  } catch (error) {
    console.error("Banner upload error:", error);
    res.status(500).json({ error: 'Failed to upload banner' });
  }
});

router.post('/apk', authenticate, requireRole(...STAFF_AND_ADMIN_ROLES), upload.single('apk'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  try {
    if (useSupabase) {
      const url = await uploadToSupabase(req.file, 'apks');
      return res.json({ url });
    } else {
      const url = saveLocally(req.file, 'apks');
      return res.json({ url });
    }
  } catch (error) {
    console.error("APK upload error:", error);
    res.status(500).json({ error: 'Failed to upload APK' });
  }
});

module.exports = router;
