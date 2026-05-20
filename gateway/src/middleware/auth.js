const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the Local JWT using the backend secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smart_kisan_secret_123');
    
    if (!decoded.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token payload' });
    }

    // Inject into headers for downstream microservices compatibility
    req.headers['x-user-id']    = decoded.userId;
    req.headers['x-user-email'] = decoded.email || '';
    req.headers['x-user-role']  = decoded.role || 'farmer'; 
    req.headers['x-user-name']  = decoded.name || '';
    
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
