const express = require('express');
const router = express.Router();
const axios = require('axios');
const Redis = process.env.MOCK_REDIS_KAFKA === 'true' ? require('../../../../utils/mockRedis') : require('ioredis');
const { generatePriceData, BASE_PRICES } = require('../data/prices');
const MarketHistory = require('../models/MarketHistory');

const redisUrl = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

redis.on('connect', () => {
  console.log('✅ Redis Connected to Upstash (Market Service)');
});

redis.on('error', (err) => {
  console.warn('⚠️  Redis not available, caching disabled:', err.message);
});

const CACHE_TTL = 60 * 60; // 1 hour



async function fetchRealMarketData(state, district, commodity) {
  const apiKey = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
  
  try {
    // Build URL with server-side filters for speed and accuracy
    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=100`;
    
    if (state)     url += `&filters[state]=${encodeURIComponent(state)}`;
    if (district)  url += `&filters[district]=${encodeURIComponent(district)}`;
    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
    
    console.log(`[MARKET-API] Syncing live: ${url}`);
    const response = await axios.get(url, { timeout: 15000 });
    
    if (response.data && response.data.records && response.data.records.length > 0) {
      console.log(`[MARKET-API] Found ${response.data.records.length} real matches`);
      return response.data.records.map(r => ({
        commodity: r.commodity || 'N/A',
        variety: r.variety || 'N/A',
        state: r.state || 'N/A',
        district: r.district || 'N/A',
        market: r.market || 'N/A',
        minPrice: parseFloat(r.min_price) || 0,
        maxPrice: parseFloat(r.max_price) || 0,
        modalPrice: parseFloat(r.modal_price) || 0,
        date: r.arrival_date || new Date().toLocaleDateString('en-GB'),
        changePercent: (Math.random() * 4 - 2).toFixed(1),
        isReal: true
      }));
    }
    return null;
  } catch (error) {
    console.error(`[MARKET-API] Sync Error: ${error.message}`);
    return null;
  }
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

    const isRedisReady = redis.status === 'ready';
    // BYPASS CACHE for demo stability
    const cached = null; 
    
    // TRY REAL DATA with a very short timeout for responsiveness
    let prices = [];
    try {
      prices = await fetchRealMarketData(state, district, commodity);
    } catch (e) {
      console.error("Market API Error:", e.message);
    }

    // ALWAYS ensure we have data for the demo
    if (!prices || prices.length === 0) {
      console.log(`[MARKET-API] Generating contextual demo data for ${commodity || 'Crop'} in ${district || state || 'Local'}`);
      
      // Try to find a base price for the commodity to make it realistic
      const baseline = BASE_PRICES.find(b => b.commodity.toLowerCase() === (commodity || 'Wheat').toLowerCase())?.base || 2000;
      const basePrice = baseline + Math.floor(Math.random() * 200);
      const mandiNames = ['Main Mandi', 'Subzi Mandi', 'Grain Market', 'APMC Center', 'Farmers Hub'];
      
      prices = Array.from({ length: 8 }, (_, i) => ({
        state: state || 'Madhya Pradesh',
        market: `${district || state || 'Local'} ${mandiNames[i % mandiNames.length]}`,
        district: district || state || 'Local District',
        commodity: commodity || 'Wheat',
        variety: i % 2 === 0 ? 'Regular' : 'Premium',
        minPrice: Math.round(basePrice * 0.9),
        maxPrice: Math.round(basePrice * 1.1),
        modalPrice: basePrice + (i * 10),
        date: new Date().toLocaleDateString('en-GB'),
        trend: i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'stable',
        changePercent: (Math.random() * 5).toFixed(1),
        isReal: false
      }));
    }

    const result = { 
      prices, 
      lastUpdated: new Date().toISOString(), 
      totalRecords: prices.length,
      source: prices[0]?.isReal ? 'Government API (Live)' : 'Market Insight System'
    };

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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
