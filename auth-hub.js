/**
 * auth-hub.js (Hub 1: Identity)
 * Handles Auth and User Profiles
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
require('./services/auth-service/src/models/AuthUser');
require('./services/user-service/src/models/UserProfile');

// Routes
const authRoutes = require('./services/auth-service/src/routes/auth');
const userRoutes = require('./services/user-service/src/routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', hub: 'auth' }));

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(process.env.PORT || 5001, () => console.log('🔐 Auth Hub running on 5001'));
});
