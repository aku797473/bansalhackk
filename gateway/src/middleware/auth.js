const { getAuth } = require('@clerk/express');

const verifyToken = (req, res, next) => {
  const { userId, sessionClaims } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Inject into headers for downstream microservices compatibility
  req.headers['x-user-id']    = userId;
  req.headers['x-user-role']  = sessionClaims?.metadata?.role || 'farmer';
  req.headers['x-user-email'] = sessionClaims?.email || '';
  
  next();
};

module.exports = { verifyToken };

