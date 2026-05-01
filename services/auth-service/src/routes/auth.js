const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AuthUser = require('../models/AuthUser');

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
  return { accessToken, refreshToken };
};

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name = '', role = 'farmer' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    let user = await AuthUser.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new AuthUser({ email: email.toLowerCase(), password: hashedPassword, name, role });
    
    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);
    
    user.refreshTokens = [refreshToken];
    user.lastLoginAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const user = await AuthUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);
    
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    user.lastLoginAt = new Date();
    await user.save();
    
    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await AuthUser.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked' });
    }

    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const { accessToken, refreshToken: newRefresh } = generateTokens(payload);

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefresh);
    await user.save();

    res.json({ success: true, accessToken, refreshToken: newRefresh });
  } catch (err) {
    console.error('refresh error:', err);
    res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await AuthUser.findById(decoded.userId);
      if (user && refreshToken) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
      }
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch {
    res.json({ success: true, message: 'Logged out' });
  }
});

// GET /auth/me — validate token and return user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AuthUser.findById(decoded.userId).select('-refreshTokens -password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;
