// Firebase configuration for BurgerBoss
const admin = require('firebase-admin');

// For demo purposes, we'll use a simple JSON file approach
// In production, you'd use proper Firebase credentials

let db;

// Simple mock database for demo (will work without Firebase setup)
const mockDB = {
  collection: (name) => ({
    get: async () => ({
      docs: [],
      forEach: () => {}
    }),
    add: async (data) => ({
      id: Date.now().toString(),
      data: () => data
    }),
    doc: (id) => ({
      get: async () => ({
        exists: false,
        data: () => null
      }),
      set: async (data) => ({ id }),
      update: async (data) => ({ id }),
      delete: async () => ({ id })
    })
  })
};

try {
  // Try to initialize Firebase (will fail in demo, that's ok)
  if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      })
    });
    db = admin.firestore();
  } else {
    // Use mock database for demo
    db = mockDB;
  }
} catch (error) {
  console.log('Using mock database for demo');
  db = mockDB;
}

module.exports = { db };