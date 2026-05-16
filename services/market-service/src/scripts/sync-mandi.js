require('dotenv').config();
const axios = require('axios');
const Redis = require('ioredis');

const API_KEY = process.env.DATA_GOV_IN_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const REDIS_URL = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';

const redis = new Redis(REDIS_URL, {
  tls: REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

async function syncMandiData() {
  console.log('🔄 Starting Mandi Data Sync from data.gov.in...');
  
  try {
    // 1. Fetch data from Govt API
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=100`;
    const response = await axios.get(url);
    
    if (!response.data || !response.data.records) {
      throw new Error('Invalid response from Govt API');
    }

    const records = response.data.records;
    console.log(`✅ Fetched ${records.length} records.`);

    // 2. Format data for our system
    const formattedPrices = records.map(r => ({
      state: r.state,
      district: r.district,
      market: r.market,
      commodity: r.commodity,
      variety: r.variety || 'Hybrid',
      minPrice: Number(r.min_price),
      maxPrice: Number(r.max_price),
      modalPrice: Number(r.modal_price),
      date: r.arrival_date,
      trend: 'stable', // We can calculate this if we have historical data
      changePercent: '0.0',
      source: 'Government Mandi Data'
    }));

    // 3. Store in Redis
    // We store per state for faster lookup
    const states = [...new Set(formattedPrices.map(p => p.state))];
    
    for (const state of states) {
      const statePrices = formattedPrices.filter(p => p.state === state);
      await redis.set(`market:prices:${state.toLowerCase()}`, JSON.stringify(statePrices), 'EX', 86400); // 24h cache
    }

    // Also store a global "all-markers" for the map
    const markers = formattedPrices.map(p => ({
      lat: 0, // We would need a geocoding service for a real startup
      lng: 0,
      type: 'market',
      title: `${p.market} Mandi`,
      info: `${p.commodity}: ₹${p.modalPrice}/Q`,
      detail: `State: ${p.state} · Updated: ${p.date}`
    }));
    // Note: Geocoding is expensive, so for now we keep lat/lng as 0 or use a mapping table
    
    console.log('🚀 Sync Completed Successfully!');
  } catch (err) {
    console.error('❌ Sync Failed:', err.message);
  } finally {
    redis.quit();
  }
}

syncMandiData();
