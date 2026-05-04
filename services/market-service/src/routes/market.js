const express = require('express');
const router = express.Router();
const axios = require('axios');
const Redis = process.env.MOCK_REDIS_KAFKA ? require('../../../../utils/mockRedis') : require('ioredis');
const { generatePriceData, BASE_PRICES } = require('../data/prices');
const MarketHistory = require('../models/MarketHistory');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

redis.on('error', (err) => {
  console.warn('⚠️  Redis not available, caching disabled:', err.message);
});

const CACHE_TTL = 60 * 60; // 1 hour

const DATA_GOV_API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';

// Helper to fetch real data from Govt API
async function fetchRealMarketData(state, district, commodity) {
  try {
    let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${DATA_GOV_API_KEY}&format=json&limit=100`;
    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
    if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;

    const response = await axios.get(url, { timeout: 5000 });
    if (response.data && response.data.records) {
      return response.data.records.map(r => {
        const parsedMin = parseFloat(r.min_price);
        const parsedMax = parseFloat(r.max_price);
        let parsedModal = parseFloat(r.modal_price);
        
        // If modal price is NA/missing, try to average min/max or fallback to 0
        if (isNaN(parsedModal)) {
          if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
            parsedModal = Math.round((parsedMin + parsedMax) / 2);
          } else {
            parsedModal = parsedMax || parsedMin || 0;
          }
        }

        return {
          state: r.state,
          market: r.market,
          district: r.district,
          commodity: r.commodity,
          variety: r.variety,
          minPrice: isNaN(parsedMin) ? parsedModal : parsedMin,
          maxPrice: isNaN(parsedMax) ? parsedModal : parsedMax,
          modalPrice: parsedModal,
          date: r.arrival_date,
          trend: 'stable',
          changePercent: 0,
          isReal: true
        };
      });
    }
  } catch (e) {
    console.error('Govt API fetch failed:', e.message);
  }
  return null;
}

// GET /market/history
router.get('/history', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const history = await MarketHistory.find({ userId }).sort({ timestamp: -1 }).limit(20);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /market/prices
router.get('/prices', async (req, res) => {
  try {
    const { state, commodity, district } = req.query;
    const userId = req.headers['x-user-id'] || 'anonymous';

    // Record history
    MarketHistory.create({ userId, state, district, commodity, searchType: 'prices' }).catch(console.error);

    const cacheKey = `market:prices:${state || 'all'}:${district || 'all'}:${commodity || 'all'}`;

    const isRedisReady = redis.status === 'ready';
    const cached = isRedisReady ? await redis.get(cacheKey) : null;
    if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

    // Try Real Data First
    let prices = await fetchRealMarketData(state, district, commodity);

    // Fallback to Mock Data if API fails or returns no records
    if (!prices || prices.length === 0) {
      prices = generatePriceData();
      if (state) prices = prices.filter(p => p.state.toLowerCase().includes(state.toLowerCase()));
      if (commodity) prices = prices.filter(p => p.commodity.toLowerCase().includes(commodity.toLowerCase()));
      if (district) prices = prices.filter(p => p.market.toLowerCase().includes(district.toLowerCase()));
    }

    const result = { prices, lastUpdated: new Date().toISOString(), totalRecords: prices.length };
    if (isRedisReady) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
    }
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /market/commodities
router.get('/commodities', async (req, res) => {
  const { BASE_PRICES } = require('../data/prices');
  const commodities = [...new Set(BASE_PRICES.map(p => p.commodity))];
  res.json({ success: true, data: commodities });
});

// GET /market/states
router.get('/states', async (req, res) => {
  const { BASE_PRICES } = require('../data/prices');
  const states = [...new Set(BASE_PRICES.map(p => p.state))].sort();
  res.json({ success: true, data: states });
});

// GET /market/districts
router.get('/districts', async (req, res) => {
  const { state } = req.query;
  const { BASE_PRICES } = require('../data/prices');
  let filtered = BASE_PRICES;
  if (state) {
    filtered = filtered.filter(p => p.state.toLowerCase() === state.toLowerCase());
  }
  const districts = [...new Set(filtered.map(p => p.market))].sort();
  res.json({ success: true, data: districts });
});

// GET /market/trends?commodity=Wheat
router.get('/trends', async (req, res) => {
  try {
    const { commodity = 'Wheat', state, market } = req.query;
    const userId = req.headers['x-user-id'] || 'anonymous';
    
    // Record history (Fire and forget)
    MarketHistory.create({ userId, state, district: market, commodity, searchType: 'trends' }).catch(console.error);

    const cacheKey = `market:trends:${commodity}:${state || 'all'}:${market || 'all'}`;
    const isRedisReady = redis.status === 'ready';
    
    if (isRedisReady) {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    const historicalDays = 30;
    const forecastDays = 15;
    
    // First try to get real base price from Govt API
    let basePrice = 2000; // default fallback
    let isRealData = false;
    const realData = await fetchRealMarketData(state, market, commodity);
    
    if (realData && realData.length > 0) {
      basePrice = realData[0].modalPrice || realData[0].minPrice || 2000;
      isRealData = true;
    } else {
      // Fallback to our mock baseline
      let baseObj = BASE_PRICES.find(p => {
        const matchComm = p.commodity.toLowerCase() === commodity.toLowerCase();
        const matchState = state ? p.state.toLowerCase().includes(state.toLowerCase()) : true;
        const matchMarket = market ? p.market.toLowerCase().includes(market.toLowerCase()) : true;
        return matchComm && matchState && matchMarket;
      });
      if (!baseObj) {
        baseObj = BASE_PRICES.find(p => p.commodity.toLowerCase() === commodity.toLowerCase());
      }
      if (baseObj) basePrice = baseObj.base;
    }


    const allTrends = [];
    let lastPrice = basePrice;

    // Generate historical backwards from current real/base price
    for (let i = historicalDays; i >= 1; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const variation = 1 + (Math.sin((historicalDays - i) / 5) * 0.05) + ((Math.random() - 0.5) * 0.04);
      const pastPrice = Math.round(basePrice * variation);
      allTrends.push({
        date: date.toISOString().split('T')[0],
        price: pastPrice,
        type: 'historical'
      });
    }

    // Add today (Real Price)
    const today = new Date();
    allTrends.push({
      date: today.toISOString().split('T')[0],
      price: basePrice,
      type: 'historical'
    });

    // Generate forecast forwards from real current price
    let forecastPrice = basePrice;
    for (let i = 1; i <= forecastDays; i++) {
      const date = new Date(Date.now() + i * 86400000);
      // Introduce slight trend up or down based on some math
      const drift = 1 + (Math.sin(i / 3) * 0.03) + ((Math.random() - 0.5) * 0.02);
      forecastPrice = Math.round(forecastPrice * drift);
      allTrends.push({
        date: date.toISOString().split('T')[0],
        price: forecastPrice,
        type: 'forecast'
      });
    }

    const result = { commodity, state: state || 'India', market: market || 'All Markets', trends: allTrends, isRealData };
    
    if (isRedisReady) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /market/map-markers
router.get('/map-markers', async (req, res) => {
  try {
    const cacheKey = 'market:map-markers';
    const isRedisReady = redis.status === 'ready';
    if (isRedisReady) {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    const coords = {
      'Rewa': { lat: 24.5333, lng: 81.3000 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Bhopal': { lat: 23.2599, lng: 77.4126 },
      'Lucknow': { lat: 26.8467, lng: 80.9462 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Amritsar': { lat: 31.6340, lng: 74.8723 },
      'Ludhiana': { lat: 30.9010, lng: 75.8573 },
      'Nashik': { lat: 19.9975, lng: 73.7898 },
      'Patna': { lat: 25.5941, lng: 85.1376 },
    };

    const prices = generatePriceData();
    const markers = prices
      .filter(p => coords[p.market])
      .map(p => ({
        lat: coords[p.market].lat,
        lng: coords[p.market].lng,
        type: 'market',
        title: `${p.market} Mandi`,
        info: `${p.commodity}: ₹${p.modalPrice}/Q`,
        detail: `State: ${p.state} · Trend: ${p.trend.toUpperCase()} (${p.changePercent}%)`
      }));

    if (isRedisReady) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(markers)).catch(() => {});
    }

    res.json({ success: true, data: markers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
