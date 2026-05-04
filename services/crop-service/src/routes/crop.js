const express = require('express');
const router = express.Router();
const Redis = process.env.MOCK_REDIS_KAFKA === 'true' ? require('../../../../utils/mockRedis') : require('ioredis');
const { OpenAI } = require('openai');

const redisUrl = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

redis.on('error', (err) => {
  const safeUrl = redisUrl.replace(/:[^:@]+@/, ':***@');
  console.warn(`⚠️  Redis (${safeUrl}) not available, caching disabled:`, err.message);
});

const CACHE_TTL = 60 * 60 * 6; // 6 hours

// Gemini AI
const openai = (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_'))
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Rule-based fallback crop recommendation
const getRuleBasedRecommendation = ({ soilType, rainfall, temperature, season, state }) => {
  const crops = {
    kharif: {
      loamy: ['Rice', 'Maize', 'Cotton', 'Soybean'],
      clay:  ['Rice', 'Sugarcane', 'Jute'],
      sandy: ['Groundnut', 'Millets', 'Sesame'],
    },
    rabi: {
      loamy: ['Wheat', 'Mustard', 'Chickpea', 'Peas'],
      clay:  ['Wheat', 'Barley', 'Lentils'],
      sandy: ['Barley', 'Mustard', 'Chickpea'],
    },
    zaid: {
      loamy: ['Watermelon', 'Muskmelon', 'Cucumber'],
      clay:  ['Bitter Gourd', 'Pumpkin'],
      sandy: ['Moong Dal', 'Watermelon'],
    },
  };
  const soil = soilType?.toLowerCase() || 'loamy';
  const s = season?.toLowerCase() || 'kharif';
  const recommended = crops[s]?.[soil] || crops.kharif.loamy;

  return {
    primaryCrop: recommended[0],
    alternativeCrops: recommended.slice(1),
    season: s,
    sowingTime: s === 'kharif' ? 'June–July' : s === 'rabi' ? 'October–November' : 'March–April',
    harvestTime: s === 'kharif' ? 'October–November' : s === 'rabi' ? 'March–April' : 'June',
    waterRequirement: rainfall > 800 ? 'High' : rainfall > 400 ? 'Medium' : 'Low',
    fertilizers: ['Urea (N)', 'DAP (P)', 'MOP (K)'],
    tips: [
      `Best suited for ${soil} soil in ${s} season`,
      'Use certified seeds from government-approved sources',
      'Apply recommended doses of fertilizer in split applications',
      'Monitor for pests every 10–15 days',
    ],
    isFallback: true,
  };
};

// POST /crop/recommend
router.post('/recommend', async (req, res) => {
  try {
    const {
      soilType, soilPH, nitrogen, phosphorus, potassium,
      temperature, humidity, rainfall, season, state, district,
    } = req.body;

    const cacheKey = `crop:rec:${soilType}:${season}:${state}:${Math.round(temperature)}`;
    const isRedisReady = redis.status === 'ready';
    const cached = isRedisReady ? await redis.get(cacheKey) : null;
    if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

    let recommendation;

    if (openai) {
      const prompt = `You are an expert agricultural advisor for Indian farmers.
Given the following soil and climate data, recommend the best crops to grow.

Soil Type: ${soilType || 'Loamy'}
Soil pH: ${soilPH || 6.5}
Nitrogen (N): ${nitrogen || 'Medium'} kg/ha
Phosphorus (P): ${phosphorus || 'Medium'} kg/ha
Potassium (K): ${potassium || 'Medium'} kg/ha
Temperature: ${temperature || 28}°C
Humidity: ${humidity || 65}%
Annual Rainfall: ${rainfall || 800} mm
Season: ${season || 'Kharif'}
State: ${state || 'Punjab'}
District: ${district || ''}

Respond with a valid JSON object with these exact fields:
{
  "primaryCrop": "string",
  "alternativeCrops": ["string", "string", "string"],
  "season": "string",
  "sowingTime": "string",
  "harvestTime": "string",
  "waterRequirement": "Low|Medium|High",
  "fertilizers": ["string"],
  "tips": ["string", "string", "string"],
  "expectedYield": "string",
  "marketDemand": "Low|Medium|High"
}`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        });

        recommendation = JSON.parse(completion.choices[0].message.content);
      } catch (err) {
        console.warn('OpenAI crop advice failed, using fallback:', err.message);
        recommendation = getRuleBasedRecommendation(req.body);
      }
    } else {
      recommendation = getRuleBasedRecommendation(req.body);
    }

    if (isRedisReady) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(recommendation)).catch(() => {});
    }

    res.json({ success: true, data: recommendation });
  } catch (err) {
    console.error('Crop recommend error:', err);
    res.status(500).json({ success: false, message: 'Recommendation failed' });
  }
});

// GET /crop/calendar?crop=Wheat&state=Punjab
router.get('/calendar', async (req, res) => {
  try {
    const { crop, state = 'Punjab' } = req.query;
    if (!crop) return res.status(400).json({ success: false, message: 'crop is required' });

    const cacheKey = `crop:calendar:${crop.toLowerCase()}:${state.toLowerCase()}`;
    const isRedisReady = redis.status === 'ready';
    if (isRedisReady) {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    const calendar = {
      crop, state,
      activities: [
        { month: 'October',  activity: 'Land Preparation & Sowing',     notes: 'Use certified seeds, row spacing 22.5cm' },
        { month: 'November', activity: 'Irrigation #1 + Weed Control',  notes: 'Apply pre-emergence herbicide' },
        { month: 'December', activity: 'Fertilizer Top Dressing (Urea)', notes: 'First irrigation after sowing' },
        { month: 'January',  activity: 'Irrigation #3 + Pest Monitoring', notes: 'Watch for aphids and rust' },
        { month: 'February', activity: 'Last Irrigation + Maturity',    notes: 'Stop irrigation 2 weeks before harvest' },
        { month: 'March',    activity: 'Harvest',                        notes: 'Harvest when moisture < 12%' },
      ],
    };

    if (isRedisReady) {
      await redis.setex(cacheKey, 86400, JSON.stringify(calendar)).catch(() => {});
    }

    res.json({ success: true, data: calendar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
