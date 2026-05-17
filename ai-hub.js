/**
 * ai-hub.js (Hub 2: Intelligence)
 * Handles Chatbot, Crop Advisor, and Fertilizer AI
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
require('./services/chatbot-service/src/models/ChatHistory');

// Routes
const cropRoutes = require('./services/crop-service/src/routes/crop');
const fertilizerRoutes = require('./services/fertilizer-service/src/routes/fertilizer');
const chatRoutes = require('./services/chatbot-service/src/routes/chat');

app.use('/api/crop', verifyToken, cropRoutes);
app.use('/api/fertilizer', verifyToken, fertilizerRoutes);
app.use('/api/chatbot', verifyToken, chatRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', hub: 'ai' }));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🤖 AI Hub running on ${PORT}`));

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected (AI Hub)'))
  .catch(err => console.error('⚠️ MongoDB connection error (AI Hub):', err.message));

