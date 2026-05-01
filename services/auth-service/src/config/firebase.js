const admin = require('firebase-admin');

// In development/testing without Firebase credentials, create a mock admin
if (!process.env.FIREBASE_PROJECT_ID || process.env.NODE_ENV === 'development') {
  console.warn('⚠️  Firebase credentials not set — running in mock mode');
  module.exports = {
    auth: () => ({
      verifyIdToken: async (token) => {
        throw new Error('Firebase not configured');
      },
    }),
  };
} else {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
  module.exports = admin;
}
