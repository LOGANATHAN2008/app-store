const admin = require('firebase-admin');

let db;

const initFirebase = () => {
  if (admin.apps.length > 0) return admin.apps[0];

  // In demo mode, use in-memory data store
  if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === 'demo-app-store') {
    console.log('⚠️  Firebase running in DEMO mode (in-memory store)');
    return null;
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    db = admin.firestore();
    console.log('✅ Firebase Admin initialized');
    return app;
  } catch (err) {
    console.error('❌ Firebase init error:', err.message);
    return null;
  }
};

const getDb = () => db;

module.exports = { initFirebase, getDb, admin };
