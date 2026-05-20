const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

redis.on('connect', () => {
  console.log('✅ Redis Connected to Upstash (User Service)');
});

redis.on('error', (err) => console.warn('⚠️  Redis not available in User Service:', err.message));

const CACHE_TTL = 3600; // 1 hour

// Helpers: extract user info from gateway-injected headers
const getUserInfo = (req) => ({
  userId: req.headers['x-user-id'],
  email:  req.headers['x-user-email'] || req.headers['x-user-phone'],
  role:   req.headers['x-user-role'],
  name:   req.headers['x-user-name'] || '',
});

// GET /users/profile
router.get('/profile', async (req, res) => {
  try {
    const { userId, email, role } = getUserInfo(req);
    const cacheKey = `user:profile:${userId}`;

    // Try Cache
    if (redis.status === 'ready') {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
      } catch (err) {
        console.warn('⚠️ Redis GET Error (falling back to MongoDB):', err.message);
      }
    }

    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      profile = new UserProfile({ 
        userId, 
        email, 
        role, 
        name: name || 'Smart Farmer',
        location: { village: 'Satna', district: 'Satna', state: 'Madhya Pradesh' }
      });
      await profile.save();
    } else if (!profile.name || profile.name === 'Smart Farmer') {
      if (name && name !== 'Smart Farmer') {
        profile.name = name;
        await profile.save();
      }
    }
    
    // Set Cache
    if (redis.status === 'ready') {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(profile)).catch(() => {});
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error('User GET Profile Error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message, 
      dbState: require('mongoose').connection.readyState 
    });
  }
});

// POST /users/profile — create or update
router.post('/profile', async (req, res) => {
  try {
    const { userId, email, role } = getUserInfo(req);
    
    const updateData = { userId };
    if (email) updateData.email = email;
    
    // Support role update from request body
    if (req.body.role !== undefined) {
      updateData.role = req.body.role;
    } else if (role) {
      updateData.role = role;
    }
    
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.language !== undefined) updateData.language = req.body.language;
    if (req.body.location !== undefined) updateData.location = req.body.location;
    if (req.body.farmDetails !== undefined) updateData.farmDetails = req.body.farmDetails;
    if (req.body.profilePic !== undefined) updateData.profilePic = req.body.profilePic;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    // Sync changes to AuthUser model if it exists
    const mongoose = require('mongoose');
    let newAccessToken = null;
    try {
      const AuthUser = mongoose.models.AuthUser || mongoose.model('AuthUser');
      if (AuthUser) {
        const authUpdate = {};
        if (req.body.name !== undefined) authUpdate.name = req.body.name;
        if (req.body.phone !== undefined) authUpdate.phone = req.body.phone;
        if (req.body.role !== undefined) authUpdate.role = req.body.role;
        
        if (Object.keys(authUpdate).length > 0) {
          const updatedAuth = await AuthUser.findByIdAndUpdate(
            userId,
            { $set: authUpdate },
            { new: true }
          );
          
          if (updatedAuth) {
            const jwt = require('jsonwebtoken');
            const jwtPayload = {
              userId: updatedAuth._id.toString(),
              phone: updatedAuth.phone || '',
              email: updatedAuth.email || '',
              role: updatedAuth.role,
              name: updatedAuth.name || ''
            };
            newAccessToken = jwt.sign(jwtPayload, process.env.JWT_SECRET || 'smart_kisan_secret_123', {
              expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            });
          }
        }
      }
    } catch (authErr) {
      console.warn('⚠️ AuthUser DB sync failed:', authErr.message);
    }

    // Invalidate Cache
    if (redis.status === 'ready') {
      await redis.del(`user:profile:${userId}`).catch(() => {});
    }

    res.json({ 
      success: true, 
      data: profile,
      accessToken: newAccessToken
    });
  } catch (err) {
    console.error('User POST Profile Error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message, 
      dbState: require('mongoose').connection.readyState 
    });
  }
});

// PATCH /users/language
router.patch('/language', async (req, res) => {
  try {
    const { userId } = getUserInfo(req);
    const { language } = req.body;
    const valid = ['en', 'hi', 'pa', 'ta', 'te'];
    if (!valid.includes(language)) {
      return res.status(400).json({ success: false, message: 'Invalid language code' });
    }
    await UserProfile.updateOne({ userId }, { $set: { language } });
    res.json({ success: true, message: 'Language updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /users/location
router.patch('/location', async (req, res) => {
  try {
    const { userId } = getUserInfo(req);
    const { lat, lng, village, district, state, pincode } = req.body;
    await UserProfile.updateOne({ userId }, { $set: { location: { lat, lng, village, district, state, pincode } } });
    res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /users/all — admin only
router.get('/all', async (req, res) => {
  try {
    const { role } = getUserInfo(req);
    if (role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });
    const users = await UserProfile.find().select('-__v').limit(100);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /users/feedback
router.post('/feedback', async (req, res) => {
  try {
    const { userId } = getUserInfo(req);
    const { rating, suggestion, feature, name } = req.body;
    
    // We import locally to avoid circular dependencies if any
    const Feedback = require('../models/Feedback');
    
    const feedback = new Feedback({
      userId: userId || 'anonymous',
      name: name || 'Anonymous Farmer',
      rating,
      suggestion,
      feature: feature || 'general'
    });
    
    await feedback.save();
    res.status(201).json({ success: true, message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
