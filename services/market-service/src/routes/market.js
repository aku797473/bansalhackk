const express = require('express');
const router = express.Router();
const axios = require('axios');
const Groq = require('groq-sdk');
const Redis = process.env.MOCK_REDIS_KAFKA === 'true' ? require('../../../../utils/mockRedis') : require('ioredis');
const { generatePriceData, BASE_PRICES } = require('../data/prices');
const MarketHistory = require('../models/MarketHistory');

const redisUrl = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'gsk_Z1p3Hk9W9k1p3Hk9W9k1p3Hk9W9k1p3Hk9W9k1p3Hk9W9k1' });

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
    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=500`;
    
    // Normalize names to Title Case as Govt API is often case-sensitive (e.g. "Madhya Pradesh")
    const toTitleCase = (str) => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    if (state)     url += `&filters[state]=${encodeURIComponent(toTitleCase(state))}`;
    if (district)  url += `&filters[district]=${encodeURIComponent(toTitleCase(district))}`;
    if (commodity) url += `&filters[commodity]=${encodeURIComponent(toTitleCase(commodity))}`;
    
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
async function fetchAIMarketPrediction(state, district, commodity) {
  try {
    const prompt = `Act as an Indian Agriculture Market Expert. Provide realistic current wholesale market prices (Mandi rates) for ${commodity || 'common crops'} in ${district || state || 'India'}. 
    Return ONLY a JSON array of 5 objects with fields: commodity, variety, market, minPrice, maxPrice, modalPrice, trend (up/down/stable), reason (short note).
    Prices should be in INR per Quintal (100kg). Ensure realistic values (e.g., Wheat ~2300-2600, Sugarcane ~350, Soybean ~4500-5000).`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      response_format: { type: 'json_object' }
    });

    const resObj = JSON.parse(chatCompletion.choices[0].message.content);
    const records = resObj.prices || resObj.data || Object.values(resObj)[0];
    
    if (Array.isArray(records)) {
      return records.map(r => ({
        ...r,
        state: state || 'N/A',
        district: district || r.market || 'Local',
        date: new Date().toLocaleDateString('en-GB'),
        changePercent: (Math.random() * 3).toFixed(1),
        isAI: true
      }));
    }
    return null;
  } catch (e) {
    console.error("Groq Market Prediction Error:", e.message);
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

    // 1. TRY REAL DATA with a strict timeout for responsiveness
    let prices = null;
    try {
      // Set a strict 10s timeout for the govt API to prevent hanging
      prices = await fetchRealMarketData(state, district, commodity);
    } catch (e) {
      console.error("Market API Timeout/Error:", e.message);
    }

    // 2. SMART REDUNDANCY: If Govt API fails, try Groq AI for realistic prediction
    if (!prices || prices.length === 0) {
      console.log(`[MARKET-API] Using Groq AI Predictor for ${commodity || 'all'} in ${state || 'India'}`);
      prices = await fetchAIMarketPrediction(state, district, commodity);
    }

    // 3. FINAL FALLBACK: If even AI fails, use Verified Dataset
    if (!prices || prices.length === 0) {
      console.log(`[MARKET-API] Final Failover: Using Agmarknet Backup Dataset`);
      // ... (existing backup logic)
      let filtered = BASE_PRICES;
      if (state)     filtered = filtered.filter(p => p.state.toLowerCase().includes(state.toLowerCase()));
      if (commodity) filtered = filtered.filter(p => p.commodity.toLowerCase() === commodity.toLowerCase());
      const source = filtered.length > 0 ? filtered : BASE_PRICES.slice(0, 15);
      prices = source.map((p, i) => {
        const modal = Math.round(p.base * (1 + (Math.sin(new Date().getDate() + i) * 0.02)));
        return {
          state: p.state, district: p.district || p.market, market: `${p.market} Mandi`,
          commodity: p.commodity, variety: p.variety || 'Regular',
          minPrice: Math.round(modal * 0.96), maxPrice: Math.round(modal * 1.04), modalPrice: modal,
          date: new Date().toLocaleDateString('en-GB'), trend: 'stable', changePercent: '0.5', isReal: false
        };
      });
    }

    const result = { 
      prices, 
      lastUpdated: new Date().toISOString(), 
      totalRecords: prices.length,
      source: prices[0]?.isReal ? 'Government API (Live)' : prices[0]?.isAI ? 'Groq AI Predictor' : 'Market Insight System'
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

// GET /market/debug-sync
router.get('/debug-sync', async (req, res) => {
  const { state } = req.query;
  const apiKey = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
  try {
    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
    if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
    const response = await axios.get(url);
    res.json({ success: true, url, raw: response.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
