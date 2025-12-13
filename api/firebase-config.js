// Clean Firebase Configuration for BurgerBoss
const admin = require('firebase-admin');

let db = null;
let auth = null;

// Initialize Firebase Admin with Production Credentials
function initializeFirebase() {
  try {
    if (!admin.apps.length) {
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        
        // Clean and format the private key
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        
        // Handle different private key formats
        if (privateKey.includes('\\n')) {
          privateKey = privateKey.replace(/\\n/g, '\n');
        }
        
        // Ensure proper formatting
        if (!privateKey.includes('\n')) {
          // If it's all one line, add proper line breaks
          privateKey = privateKey
            .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
            .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
        }
        
        console.log('🔑 Private key format check:', {
          hasBegin: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
          hasEnd: privateKey.includes('-----END PRIVATE KEY-----'),
          hasNewlines: privateKey.includes('\n'),
          length: privateKey.length
        });
        
        // Production Firebase
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: privateKey,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        
        db = admin.firestore();
        auth = admin.auth();
        
        console.log('✅ Firebase initialized successfully');
        return true;
      } else {
        console.error('❌ Firebase credentials missing:', {
          hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
          hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
          hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL
        });
        return false;
      }
    } else {
      db = admin.firestore();
      auth = admin.auth();
      return true;
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.error('Full error:', error);
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