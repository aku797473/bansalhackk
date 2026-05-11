/**
 * business-hub.js (Hub 4: Services)
 * Handles Labour Marketplace and Payments
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { verifyToken } = require('./gateway/src/middleware/auth');
const { clerkMiddleware } = require('@clerk/express');

const app = express();
app.use(cors());
app.use(express.json());

// Clerk Middleware
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

// Load Models
require('./services/labour-service/src/models/Job');

// Routes
const labourRoutes = require('./services/labour-service/src/routes/labour');
const paymentRoutes = require('./services/payment-service/src/routes/payment');

app.use('/api/labour', labourRoutes);
app.use('/api/payment', verifyToken, paymentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', hub: 'business' }));

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(process.env.PORT || 5004, () => console.log('💼 Business Hub running on 5004'));
});
