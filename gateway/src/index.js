require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Middleware ────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

app.use(cors({
  origin: (origin, callback) => {
    // Allow any origin for the demo to avoid CORS blocks
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


// ─── Rate Limiting ────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts.' },
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
};


const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
  on: {
    error: (err, req, res) => {
      console.error(`Proxy error: ${err.message}`);
      res.status(503).json({ success: false, message: 'Service temporarily unavailable' });
    },
  },
});

// ─── Public Routes (no JWT) ───────────────────────
app.use('/api/auth', authLimiter, createProxyMiddleware(proxyOptions(services.auth)));

// Map Markers (Public)
app.get('/api/market/map-markers', createProxyMiddleware(proxyOptions(services.market)));
app.get('/api/weather/map-markers', createProxyMiddleware(proxyOptions(services.weather)));
app.get('/api/labour/map-markers', createProxyMiddleware(proxyOptions(services.labour)));
app.get('/api/fertilizer/soil/map-markers', createProxyMiddleware(proxyOptions(services.fertilizer)));

// ─── Protected Routes (JWT required) ─────────────
app.use('/api/users',       verifyToken, createProxyMiddleware(proxyOptions(services.user)));
app.use('/api/weather',     verifyToken, createProxyMiddleware(proxyOptions(services.weather)));
app.use('/api/crop',        verifyToken, createProxyMiddleware(proxyOptions(services.crop)));
app.use('/api/fertilizer',  verifyToken, createProxyMiddleware(proxyOptions(services.fertilizer)));
app.use('/api/market',      verifyToken, createProxyMiddleware(proxyOptions(services.market)));
app.use('/api/labour',      verifyToken, createProxyMiddleware(proxyOptions(services.labour)));
app.use('/api/chatbot',     verifyToken, createProxyMiddleware(proxyOptions(services.chatbot)));
app.use('/api/news',        verifyToken, createProxyMiddleware(proxyOptions(services.news)));
app.use('/api/payment',     verifyToken, createProxyMiddleware(proxyOptions(services.payment)));


app.get('/', (req, res) => {
  res.json({ message: 'Smart Kisan API Gateway is running. Use /health for status.' });
});

// ─── Health Check ─────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: Object.keys(services),
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Services: ${Object.keys(services).join(', ')}`);
});
