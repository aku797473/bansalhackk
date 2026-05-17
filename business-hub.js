/**
 * business-hub.js (Hub 4: Services)
 * Handles Labour Marketplace and Payments
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { verifyToken } = require('./gateway/src/middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Load Models
require('./services/labour-service/src/models/Job');
require('./services/market-service/src/models/MarketHistory');
require('./services/buyer-service/src/models/Buyer');

// Routes
const marketRoutes = require('./services/market-service/src/routes/market');
const labourRoutes = require('./services/labour-service/src/routes/labour');
const paymentRoutes = require('./services/payment-service/src/routes/payment');
const buyerRoutes = require('./services/buyer-service/src/routes/buyer');

app.use('/api/market', (req, res, next) => {
  if (req.method === 'GET') return next();
  return verifyToken(req, res, next);
}, marketRoutes);

app.use('/api/labour', (req, res, next) => {
  if (req.method === 'GET') return next();
  return verifyToken(req, res, next);
}, labourRoutes);
app.use('/api/payment', verifyToken, paymentRoutes);
app.use('/api/buyer', verifyToken, buyerRoutes);

app.get('/test-direct', (req, res) => res.send('Direct test working!'));
app.get('/api/labour/test-direct', (req, res) => res.send('API Labour test direct working!'));
app.get('/health', (req, res) => res.json({ status: 'ok', hub: 'business' }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 [BUSINESS-HUB ERROR]:', err);
  res.status(500).json({
    success: false,
    message: err.message,
    stack: err.stack
  });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`💼 Business Hub running on ${PORT}`));

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected (Business Hub)'))
  .catch(err => console.error('⚠️ MongoDB connection error (Business Hub):', err.message));

