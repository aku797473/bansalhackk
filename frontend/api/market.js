const mongoose = require('mongoose');
const axios = require('axios');
const Redis = require('ioredis');

// --- MongoDB Configuration ---
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  cachedDb = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return cachedDb;
}

const MarketHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  state: { type: String },
  district: { type: String },
  commodity: { type: String },
  searchType: { type: String, enum: ['prices', 'trends'], required: true },
  timestamp: { type: Date, default: Date.now }
});
const MarketHistory = mongoose.models.MarketHistory || mongoose.model('MarketHistory', MarketHistorySchema);

// --- Market Data ---
const BASE_PRICES = [
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Rewa', base: 2350 },
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Indore', base: 2400 },
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Bhopal', base: 2380 },
  { commodity: 'Soybean', variety: 'Yellow', state: 'Madhya Pradesh', market: 'Indore', base: 4500 },
  { commodity: 'Sugarcane', variety: 'Co-0238', state: 'Uttar Pradesh', market: 'Muzaffarnagar', base: 350 },
  { commodity: 'Onion', variety: 'Red', state: 'Maharashtra', market: 'Lasalgaon', base: 1800 },
  { commodity: 'Cotton', variety: 'BT', state: 'Maharashtra', market: 'Nagpur', base: 7100 },
  { commodity: 'Rice', variety: 'Basmati', state: 'Punjab', market: 'Amritsar', base: 3600 },
  { commodity: 'Mustard', variety: 'Black', state: 'Rajasthan', market: 'Alwar', base: 5100 },
  { commodity: 'Maize', variety: 'Hybrid', state: 'Bihar', market: 'Patna', base: 1900 },
];

const generatePriceData = () => {
  return BASE_PRICES.map(item => {
    const variation = 1 + (Math.random() * 0.1 - 0.05);
    const modalPrice = Math.round(item.base * variation);
    return {
      ...item, minPrice: Math.round(modalPrice * 0.95), modalPrice, maxPrice: Math.round(modalPrice * 1.05),
      trend: variation > 1.01 ? 'up' : variation < 0.99 ? 'down' : 'stable',
      changePercent: ((variation - 1) * 100).toFixed(1),
      date: new Date().toISOString().split('T')[0]
    };
  });
};

// --- Redis Configuration ---
const redisUrl = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';
let redis = null;
try {
  redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, retryStrategy: () => null });
} catch (e) {
  console.warn('Redis init failed:', e.message);
}

const DATA_GOV_API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
const CACHE_TTL = 3600;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectToDatabase().catch(() => {});

  const endpoint = req.url.split('?')[0].split('/').pop();

  try {
    if (endpoint === 'prices') {
      const { state, commodity, district } = req.query;
      const userId = req.headers['x-user-id'] || 'anonymous';
      const cacheKey = `market:prices:${state || 'all'}:${district || 'all'}:${commodity || 'all'}`;
      
      let cached = null;
      if (redis) cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

      let prices = generatePriceData();
      if (state) prices = prices.filter(p => p.state.toLowerCase().includes(state.toLowerCase()));
      if (commodity) prices = prices.filter(p => p.commodity.toLowerCase().includes(commodity.toLowerCase()));
      
      const result = { prices, lastUpdated: new Date().toISOString(), totalRecords: prices.length };
      if (redis) await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
      if (mongoose.connection.readyState === 1) MarketHistory.create({ userId, state, district, commodity, searchType: 'prices' }).catch(() => {});
      return res.json({ success: true, data: result });
    }

    if (endpoint === 'commodities') {
      const commodities = [...new Set(BASE_PRICES.map(p => p.commodity))];
      return res.json({ success: true, data: commodities });
    }

    if (endpoint === 'states') {
      const states = [...new Set(BASE_PRICES.map(p => p.state))].sort();
      return res.json({ success: true, data: states });
    }

    if (endpoint === 'trends') {
      const { commodity = 'Wheat', state } = req.query;
      const result = { commodity, state: state || 'India', trends: [], isRealData: false };
      return res.json({ success: true, data: result });
    }

    res.status(404).json({ success: false, message: 'Endpoint not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
