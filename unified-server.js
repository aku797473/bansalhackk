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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Clerk
try {
  const { clerkMiddleware } = require('@clerk/express');
  app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  }));
} catch (e) {
  console.warn('⚠️ Clerk not available');
}

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

// PRE-LOAD ALL MODELS to avoid "MissingSchemaError"
safeRequire('./services/auth-service/src/models/AuthUser', 'Model:AuthUser');
safeRequire('./services/user-service/src/models/UserProfile', 'Model:UserProfile');
safeRequire('./services/labour-service/src/models/Job', 'Model:Job');
safeRequire('./services/chatbot-service/src/models/ChatHistory', 'Model:ChatHistory');
safeRequire('./services/weather-service/src/models/WeatherHistory', 'Model:WeatherHistory');
safeRequire('./services/market-service/src/models/MarketHistory', 'Model:MarketHistory');

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

// ─── Public Routes ───────────────────────────────
if (authRoutes) app.use('/api/auth', authRoutes);

app.get('/api/wake', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'unified', 
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
    timestamp: new Date().toISOString() 
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'unified-server' });
});

// ─── Protected Routes ────────────────────────────
if (userRoutes)       app.use('/api/users',      verifyToken, userRoutes);
if (weatherRoutes)    app.use('/api/weather',     verifyToken, weatherRoutes);
if (cropRoutes)       app.use('/api/crop',        verifyToken, cropRoutes);
if (fertilizerRoutes) app.use('/api/fertilizer',  verifyToken, fertilizerRoutes);
if (marketRoutes)     app.use('/api/market',      verifyToken, marketRoutes);
if (labourRoutes)     app.use('/api/labour',      verifyToken, labourRoutes);
if (chatRoutes)       app.use('/api/chatbot',     verifyToken, chatRoutes);
if (paymentRoutes)    app.use('/api/payment',     verifyToken, paymentRoutes);
if (schemesRoutes)    app.use('/api/schemes',     verifyToken, schemesRoutes);
if (newsRoutes)       app.use('/api/news',        verifyToken, newsRoutes);

// ─── Global Error Handler ────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 [GLOBAL ERROR]:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error', 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── MongoDB ──────────────────────────────────────
async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment variables!');
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
}

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Unified Smart Kisan Server on port ${PORT}`);
  });
});
