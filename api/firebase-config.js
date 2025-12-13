// Firebase configuration for BurgerBoss
const admin = require('firebase-admin');

// Initialize Firebase Admin (using environment variables for security)
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID || "burgerboss-demo",
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
xhQnhcZHpamyJXdudqsGRoyV7fQAhqbcmWQcqb+uMA15Hb2OcMu2WiN4MUzuOSdg
+s2ZqriHHDTOgAwHdOnEiudwMWrt4HnyGrASOCQjw3TbH5+hXBgnco3RMiHVjcx
3ExjWw4A98CsKnpxnPyyTpHSBqhOLvJAajeBQyU3RQccq89VpwTvKBGaHaQepjSK
WGAmyOL7mIBSQbNvk1gqtQAHYMeVdkrHd2PtEqRXabPEXlPeGZn52Qdvd7y5kqNZ
XD7Kt+MmPMU5LVVkSdxruQT+vSRpMVDu6xyHcuNd9h1cxPaofE1wgqVqHWMw37Eb
9IiDRfVHAgMBAAECggEBAKTmjaS6tkK8BlPXClTQ2vpz/N6uxDeS35mXpqasqskV
laAidgg/sWqpjXDbXr93otIMLlWsM+X0CqMDgSXKejLS2jx4GDjI1ZplJkO4Y/vT
M8VBbPXt4Z6L2/QaLtM2eSNFb70o/2Tu5WOTJh5xHi6jTMO5PcNiKkKv+FB0mE6B
OoohGDH6aJX3BtXDhkCmL1GxXG1RFqDjufSKuOehYHpPe26Zxk4l/T+zGCzK+5sY
6d9TGg==
-----END PRIVATE KEY-----`,
    client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk@burgerboss-demo.iam.gserviceaccount.com",
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
  });
}

const db = admin.firestore();

module.exports = { admin, db };