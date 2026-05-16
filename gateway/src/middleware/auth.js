const admin = require('firebase-admin');

// Initialize Firebase Admin
// If service account env var is present, use it. Otherwise, use project ID.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project'
    });
    console.log('✅ Firebase Admin Initialized in Gateway');
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err.message);
  }
}

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the Firebase JWT
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!decodedToken.uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    // Inject into headers for downstream microservices compatibility
    req.headers['x-user-id']    = decodedToken.uid;
    req.headers['x-user-email'] = decodedToken.email || '';
    // Role is usually stored in custom claims or Firestore. 
    // For now, we'll assume it's passed or handled downstream.
    req.headers['x-user-role']  = decodedToken.role || 'farmer'; 
    
    next();
  } catch (err) {
    console.error('[Gateway Auth Error]:', err.message);
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Invalid Token'
    });
  }
};

module.exports = { verifyToken };
