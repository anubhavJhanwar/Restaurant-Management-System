// Clean Firebase Configuration for BurgerBoss
const admin = require('firebase-admin');

let db = null;
let auth = null;

// Initialize Firebase Admin with Production Credentials
function initializeFirebase() {
  try {
    if (!admin.apps.length) {
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        // Production Firebase
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        
        db = admin.firestore();
        auth = admin.auth();
        
        console.log('✅ Firebase initialized successfully');
        return true;
      } else {
        console.error('❌ Firebase credentials missing');
        return false;
      }
    } else {
      db = admin.firestore();
      auth = admin.auth();
      return true;
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    return false;
  }
}

// Initialize on startup
const isInitialized = initializeFirebase();

module.exports = { 
  db,
  auth,
  admin,
  isConnected: () => isInitialized && db !== null,
  initializeFirebase
};