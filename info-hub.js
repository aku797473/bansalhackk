/**
 * info-hub.js (Hub 3: Information)
 * Handles Market, Weather, News, and Schemes
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
require('./services/weather-service/src/models/WeatherHistory');
require('./services/market-service/src/models/MarketHistory');

// Routes
const marketRoutes = require('./services/market-service/src/routes/market');
const weatherRoutes = require('./services/weather-service/src/routes/weather');
const newsRoutes = require('./services/news-service/src/routes/news');
const schemesRoutes = require('./services/schemes-service/src/routes/schemes');

app.use('/api/market', verifyToken, marketRoutes);
app.use('/api/weather', verifyToken, weatherRoutes);
app.use('/api/news', verifyToken, newsRoutes);
app.use('/api/schemes', verifyToken, schemesRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', hub: 'info' }));

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(process.env.PORT || 5003, () => console.log('📊 Info Hub running on 5003'));
});
