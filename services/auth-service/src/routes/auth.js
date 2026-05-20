const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AuthUser = require('../models/AuthUser');

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'smart_kisan_secret_123', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'smart_kisan_refresh_secret_456', {
    expiresIn: '30d',
  });
  return { accessToken, refreshToken };
};

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { phone, password, name = '', role = 'farmer' } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone number and password required' });
    }

    // Phone Validation (Basic 10 digit check for India)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format. Must be 10 digits.' });
    }

    // SaaS Standard Password Validation
    // Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' 
      });
    }

    let user = await AuthUser.findOne({ phone });
    if (user) {
      return res.status(400).json({ success: false, message: 'Account already exists for this number' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new AuthUser({ phone, password: hashedPassword, name, role });
    
    const payload = { userId: user._id.toString(), phone: user.phone, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);
    
    user.refreshTokens = [refreshToken];
    user.lastLoginAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user._id, phone: user.phone, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password required' });
    }
    const user = await AuthUser.findOne({ phone });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
    
    const payload = { userId: user._id.toString(), phone: user.phone, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);
    
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    user.lastLoginAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user._id, phone: user.phone || '', name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /auth/google
router.post('/google', async (req, res) => {
  try {
    const { email, name = '', googleId } = req.body;
    if (!googleId) {
      return res.status(400).json({ success: false, message: 'Google ID is required' });
    }
    
    // Find user by Google ID or by Email
    let user = await AuthUser.findOne({ googleId });
    if (!user && email) {
      user = await AuthUser.findOne({ email });
      if (user) {
        // Link Google ID to existing user
        user.googleId = googleId;
        if (!user.name) user.name = name;
        await user.save();
      }
    }
    
    // If user does not exist, create new user
    if (!user) {
      user = new AuthUser({
        email,
        name,
        googleId,
        role: 'farmer' // Default role
      });
      await user.save();
    }
    
    const payload = { userId: user._id.toString(), phone: user.phone || '', email: user.email || '', role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);
    
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    user.lastLoginAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user._id, phone: user.phone || '', email: user.email || '', name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ success: false, message: 'Google Authentication failed' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'smart_kisan_refresh_secret_456');
    const user = await AuthUser.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked' });
    }
    const payload = { userId: user._id.toString(), phone: user.phone, role: user.role };
    const { accessToken, refreshToken: newRefresh } = generateTokens(payload);
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefresh);
    await user.save();
    res.json({ success: true, accessToken, refreshToken: newRefresh });
  } catch (err) {
     res.status(401).json({ success: false, message: 'Token refresh failed' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smart_kisan_secret_123');
    const user = await AuthUser.findById(decoded.userId).select('-refreshTokens -password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;
