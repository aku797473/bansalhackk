/**
 * ai-hub.js (Hub 2: Intelligence)
 * Handles Chatbot, Crop Advisor, and Fertilizer AI
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
require('./services/chatbot-service/src/models/ChatHistory');

// Routes
const cropRoutes = require('./services/crop-service/src/routes/crop');
const fertilizerRoutes = require('./services/fertilizer-service/src/routes/fertilizer');
const chatRoutes = require('./services/chatbot-service/src/routes/chat');

app.use('/api/crop', verifyToken, cropRoutes);
app.use('/api/fertilizer', verifyToken, fertilizerRoutes);
app.use('/api/chatbot', verifyToken, chatRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', hub: 'ai' }));

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(process.env.PORT || 5002, () => console.log('🤖 AI Hub running on 5002'));
}).catch(err => console.error('MongoDB connection error:', err));
