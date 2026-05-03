const { getAuth } = require('@clerk/express');

const verifyToken = (req, res, next) => {
  try {
    const { userId, sessionClaims } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No active session' });
    }

    // Inject into headers for downstream microservices compatibility
    req.headers['x-user-id']    = userId;
    req.headers['x-user-role']  = sessionClaims?.metadata?.role || 'farmer';
    req.headers['x-user-email'] = sessionClaims?.email || '';
    
    next();
  } catch (err) {
    console.error('[Gateway Auth Error]:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication service error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};


module.exports = { verifyToken };

