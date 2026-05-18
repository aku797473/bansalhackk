/**
 * unified-server.js
 * Runs ALL microservices in a SINGLE process.
 */
require('dotenv').config({ path: '.env.runtime' });
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role', 'x-user-email'],
  credentials: true,
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan('dev'));

// FORCE JSON PARSING
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// AUTH DEBUG LOGGER
app.use((req, res, next) => {
  if (req.path.includes('/auth/')) {
    console.log(`[UNIFIED-AUTH-DEBUG] ${req.method} ${req.path} | Body: ${JSON.stringify(req.body)}`);
  }
  next();
});

// ─── Auth middleware ──────────────────────────────
const { verifyToken } = require('./gateway/src/middleware/auth');

// ─── Route Files ─────────────────────────────────
const safeRequire = (path, name) => {
  try { return require(path); }
  catch (e) { 
    console.error(`❌ FAILED TO LOAD ${name}:`, e.message); 
    return null; 
  }
};

// PRE-LOAD ALL MODELS
safeRequire('./services/auth-service/src/models/AuthUser', 'Model:AuthUser');
safeRequire('./services/user-service/src/models/UserProfile', 'Model:UserProfile');
safeRequire('./services/user-service/src/models/Feedback', 'Model:Feedback');
safeRequire('./services/labour-service/src/models/Job', 'Model:Job');
safeRequire('./services/chatbot-service/src/models/ChatHistory', 'Model:ChatHistory');
safeRequire('./services/weather-service/src/models/WeatherHistory', 'Model:WeatherHistory');
safeRequire('./services/market-service/src/models/MarketHistory', 'Model:MarketHistory');
safeRequire('./services/buyer-service/src/models/Buyer', 'Model:Buyer');
safeRequire('./services/buyer-service/src/models/Listing', 'Model:Listing');
safeRequire('./services/buyer-service/src/models/Order', 'Model:Order');

const authRoutes       = safeRequire('./services/auth-service/src/routes/auth', 'auth');
const userRoutes       = safeRequire('./services/user-service/src/routes/user', 'user');
const weatherRoutes    = safeRequire('./services/weather-service/src/routes/weather', 'weather');
const cropRoutes       = safeRequire('./services/crop-service/src/routes/crop', 'crop');
const fertilizerRoutes = safeRequire('./services/fertilizer-service/src/routes/fertilizer', 'fertilizer');
const marketRoutes     = safeRequire('./services/market-service/src/routes/market', 'market');
const labourRoutes     = safeRequire('./services/labour-service/src/routes/labour', 'labour');
const chatRoutes       = safeRequire('./services/chatbot-service/src/routes/chat', 'chatbot');
const paymentRoutes    = safeRequire('./services/payment-service/src/routes/payment', 'payment');
const schemesRoutes    = safeRequire('./services/schemes-service/src/routes/schemes', 'schemes');
const newsRoutes       = safeRequire('./services/news-service/src/routes/news', 'news');
const buyerRoutes      = safeRequire('./services/buyer-service/src/routes/buyer', 'buyer');

// ─── Public Routes ───────────────────────────────
if (authRoutes) app.use('/api/auth', authRoutes);

app.get('/api/wake', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'unified',
    dbState: mongoose.connection.readyState,
    hasMongo: !!process.env.MONGODB_URI
  });
});

// ─── Microservice Routes ────────────────────────────
if (userRoutes)       app.use('/api/users',      verifyToken, userRoutes);
if (weatherRoutes)    app.use('/api/weather',     verifyToken, weatherRoutes);
if (cropRoutes)       app.use('/api/crop',        verifyToken, cropRoutes);
if (fertilizerRoutes) app.use('/api/fertilizer',  verifyToken, fertilizerRoutes);
if (marketRoutes)     app.use('/api/market', (req, res, next) => (req.method === 'GET' ? next() : verifyToken(req, res, next)), marketRoutes);
if (labourRoutes)     app.use('/api/labour', (req, res, next) => (req.method === 'GET' ? next() : verifyToken(req, res, next)), labourRoutes);
if (chatRoutes)       app.use('/api/chatbot',     verifyToken, chatRoutes);
if (paymentRoutes)    app.use('/api/payment',     verifyToken, paymentRoutes);
if (schemesRoutes)    app.use('/api/schemes',     verifyToken, schemesRoutes);
if (newsRoutes)       app.use('/api/news',        verifyToken, newsRoutes);
if (buyerRoutes)      app.use('/api/buyer',       verifyToken, buyerRoutes);

app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  try { 
    await mongoose.connect(uri); 
    console.log('✅ MongoDB connected'); 
    
    // Drop legacy unique email index in production database if it exists
    try {
      const AuthUser = mongoose.models.AuthUser || mongoose.model('AuthUser');
      if (AuthUser) {
        await AuthUser.collection.dropIndex('email_1');
        console.log('🗑️  Dropped legacy unique email index in production database');
      }
    } catch (e) {
      // Ignore error if index doesn't exist
    }

    try {
      const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile');
      if (UserProfile) {
        await UserProfile.collection.dropIndex('email_1').catch(() => {});
        await UserProfile.collection.dropIndex('phone_1').catch(() => {});
        console.log('🗑️  Dropped legacy unique email/phone indices in UserProfile collection');
      }
    } catch (e) {
      // Ignore
    }
  }
  catch (err) { console.error('❌ MongoDB Error:', err.message); }
}

connectMongo().then(() => {
  app.listen(PORT, () => console.log(`🚀 Unified Smart Kisan Server on port ${PORT}`));
});
