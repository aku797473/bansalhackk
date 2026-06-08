require('dotenv').config();
const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const { verifyToken } = require('./middleware/auth');
const mongoose = require('mongoose');

// Connect to MongoDB directly in Gateway for reliability
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan';
mongoose.connect(MONGODB_URI).then(() => console.log('✅ Gateway connected to MongoDB'));

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Global Middleware ────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan('combined'));

// IMPORTANT: Do NOT use express.json() globally before proxies.
// If you do, the body stream is consumed and proxies will send empty bodies.
// We only use it for the gateway's own internal routes if needed.

// ─── Rate Limiting ────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests' },
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Request limit exceeded' },
});

app.use(globalLimiter);

// ─── Service URLs ─────────────────────────────────
const services = {
  auth:       process.env.AUTH_SERVICE_URL       || 'http://localhost:5001',
  user:       process.env.USER_SERVICE_URL       || 'http://localhost:5002',
  weather:    process.env.WEATHER_SERVICE_URL    || 'http://localhost:5003',
  crop:       process.env.CROP_SERVICE_URL       || 'http://localhost:5004',
  fertilizer: process.env.FERTILIZER_SERVICE_URL || 'http://localhost:5005',
  market:     process.env.MARKET_SERVICE_URL     || 'http://localhost:5006',
  labour:     process.env.LABOUR_SERVICE_URL     || 'http://localhost:5007',
  chatbot:    process.env.CHATBOT_SERVICE_URL    || 'http://localhost:5008',
  news:       process.env.NEWS_SERVICE_URL       || 'http://localhost:5009',
  payment:    process.env.PAYMENT_SERVICE_URL    || 'http://localhost:5010',
  schemes:    process.env.SCHEMES_SERVICE_URL    || 'http://localhost:5011',
  buyer:      process.env.BUYER_SERVICE_URL      || 'http://localhost:5012',
};

const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
  on: {
    proxyReq: fixRequestBody, // This ensures that if any body was parsed, it's re-sent
    error: (err, req, res) => {
      console.error(`Proxy error: ${err.message}`);
      res.status(503).json({ success: false, message: 'Service temporarily unavailable' });
    },
  },
});

// ─── Public Routes (no JWT) ───────────────────────
app.use('/api/auth', strictLimiter, createProxyMiddleware(proxyOptions(services.auth)));

// Market & Info (Public for demo stability)
app.use('/api/market', createProxyMiddleware(proxyOptions(services.market)));

// Map Markers (Public)
app.get('/api/weather/map-markers', createProxyMiddleware(proxyOptions(services.weather)));
app.get('/api/labour/map-markers', createProxyMiddleware(proxyOptions(services.labour)));
app.get('/api/fertilizer/soil/map-markers', createProxyMiddleware(proxyOptions(services.fertilizer)));

// ─── Protected Routes (JWT required) ─────────────
app.use('/api/users',       verifyToken, createProxyMiddleware(proxyOptions(services.user)));
app.use('/api/weather',     verifyToken, createProxyMiddleware(proxyOptions(services.weather)));
app.use('/api/crop',        verifyToken, createProxyMiddleware(proxyOptions(services.crop)));
app.use('/api/fertilizer',  verifyToken, createProxyMiddleware(proxyOptions(services.fertilizer)));
app.use('/api/labour',      (req, res, next) => (req.method === 'GET' ? next() : verifyToken(req, res, next)), createProxyMiddleware(proxyOptions(services.labour)));
app.use('/api/chatbot',     verifyToken, strictLimiter, createProxyMiddleware(proxyOptions(services.chatbot)));
app.use('/api/news',        verifyToken, createProxyMiddleware(proxyOptions(services.news)));
app.use('/api/payment',     verifyToken, createProxyMiddleware(proxyOptions(services.payment)));
app.use('/api/schemes',     verifyToken, createProxyMiddleware(proxyOptions(services.schemes)));
app.use('/api/buyer',       (req, res, next) => (req.method === 'GET' ? next() : verifyToken(req, res, next)), createProxyMiddleware(proxyOptions(services.buyer)));

// ─── Gateway Internal Routes (Parsing JSON here is OK) ──
app.use(express.json());

app.get('/api/wake', async (req, res) => {
  const http  = require('http');
  const https = require('https');
  function pingService(url) {
    return new Promise((resolve) => {
      const mod = url.startsWith('https') ? https : http;
      mod.get(url + '/health', { timeout: 10000 }, (r) => resolve({ url, status: r.statusCode }))
         .on('error', () => resolve({ url, status: 'down' }));
    });
  }
  const results = await Promise.allSettled(Object.entries(services).map(([name, url]) => pingService(url).then(r => ({ name, ...r }))));
  res.json({ status: 'ok', services: results.map(r => r.value || r.reason) });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

app.use((err, req, res, next) => {
  console.error(`🚨 Fatal Error: ${err.stack}`);
  res.status(err.status || 500).json({ success: false, message: err.message || 'An unexpected error occurred' });
});

app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.listen(PORT, () => console.log(`🚀 API Gateway running on port ${PORT}`));
