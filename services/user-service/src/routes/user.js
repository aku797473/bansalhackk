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

redis.on('error', (err) => console.warn('⚠️  Redis not available in User Service:', err.message));

const CACHE_TTL = 3600; // 1 hour

// Helpers: extract user info from gateway-injected headers
const getUserInfo = (req) => ({
  userId: req.headers['x-user-id'],
  email:  req.headers['x-user-email'] || req.headers['x-user-phone'],
  role:   req.headers['x-user-role'],
});

// GET /users/profile
router.get('/profile', async (req, res) => {
  try {
    const { userId, email, role } = getUserInfo(req);
    const cacheKey = `user:profile:${userId}`;

    // Try Cache
    if (redis.status === 'ready') {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      profile = new UserProfile({ 
        userId, 
        email, 
        role, 
        name: 'Smart Farmer',
        location: { village: 'Satna', district: 'Satna', state: 'Madhya Pradesh' }
      });
      await profile.save();
    }
    
    // Set Cache
    if (redis.status === 'ready') {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(profile)).catch(() => {});
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /users/profile — create or update
router.post('/profile', async (req, res) => {
  try {
    const { userId, email, role } = getUserInfo(req);
    const { name, language, location, farmDetails, phone } = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { 
          userId, 
          email: email || req.body.email, 
          role, 
          name, 
          phone, 
          language, 
          location, 
          farmDetails,
          profilePic: req.body.profilePic 
        } 
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Invalidate Cache
    if (redis.status === 'ready') {
      await redis.del(`user:profile:${userId}`).catch(() => {});
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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

module.exports = router;
