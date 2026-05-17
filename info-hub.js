/**
 * info-hub.js (Hub 3: Information)
 * Handles Market, Weather, News, and Schemes
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DEBUG LOGGER
app.use((req, res, next) => {
  console.log(`[INFO-HUB] ${req.method} ${req.url}`);
  next();
});

// Load Models
require('./services/weather-service/src/models/WeatherHistory');
require('./services/market-service/src/models/MarketHistory');

// Routes
const marketRoutes = require('./services/market-service/src/routes/market');
const weatherRoutes = require('./services/weather-service/src/routes/weather');
const newsRoutes = require('./services/news-service/src/routes/news');
const schemesRoutes = require('./services/schemes-service/src/routes/schemes');

// These are public info routes, usually don't need token unless specified
app.use('/api/market', marketRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/schemes', schemesRoutes);

app.get('/api/wake', (req, res) => res.json({ status: 'ok', service: 'info-hub' }));
app.get('/health', (req, res) => res.json({ status: 'ok', hub: 'info' }));

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`📊 Info Hub running on ${PORT}`));

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected (Info Hub)'))
  .catch(err => console.error('⚠️ MongoDB connection error (Info Hub):', err.message));

