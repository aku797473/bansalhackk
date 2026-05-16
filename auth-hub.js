/**
 * auth-hub.js (Hub 1: Identity)
 * Handles Auth and User Profiles using Local JWT
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { verifyToken } = require('./gateway/src/middleware/auth');

const app = express();
app.use(cors());

// FORCE JSON PARSING AT THE TOP
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// DEBUG LOGGER: To see why the hell it's failing
app.use((req, res, next) => {
  if (req.path.includes('/auth/')) {
    console.log(`[AUTH-DEBUG] ${req.method} ${req.path} | Body keys: ${Object.keys(req.body).join(', ')}`);
  }
  next();
});

// Load Models
require('./services/auth-service/src/models/AuthUser');
require('./services/user-service/src/models/UserProfile');

// Routes
const authRoutes = require('./services/auth-service/src/routes/auth');
const userRoutes = require('./services/user-service/src/routes/user');

// Public Auth Routes
app.use('/api/auth', authRoutes);

// Protected User Routes (uses Local JWT)
app.use('/api/users', verifyToken, userRoutes);

app.get('/health', (req, res) => res.json({ 
  status: 'ok', 
  hub: 'auth', 
  identity: 'local-jwt-only' 
}));

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('✅ MongoDB Connected (Auth Hub)');
  app.listen(process.env.PORT || 5001, () => console.log('🔐 Auth Hub running on 5001'));
}).catch(err => console.error('MongoDB connection error:', err));
