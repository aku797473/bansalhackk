const { OpenAI } = require('openai');
const Redis = require('ioredis');

// --- Redis Configuration ---
const redisUrl = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';
let redis = null;
try {
  redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, retryStrategy: () => null });
} catch (e) { console.warn('Redis init failed:', e.message); }

const openai = (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_'))
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const CACHE_TTL = 3600 * 6;

const getRuleBasedRecommendation = ({ soilType, rainfall, temperature, season, language = 'en' }) => {
  const isHi = language.startsWith('hi');
  const crops = {
    kharif: { loamy: ['Rice', 'Maize', 'Cotton', 'Soybean'], clay: ['Rice', 'Sugarcane', 'Jute'], sandy: ['Groundnut', 'Millets', 'Sesame'] },
    rabi: { loamy: ['Wheat', 'Mustard', 'Chickpea', 'Peas'], clay: ['Wheat', 'Barley', 'Lentils'], sandy: ['Barley', 'Mustard', 'Chickpea'] },
    zaid: { loamy: ['Watermelon', 'Muskmelon', 'Cucumber'], clay: ['Bitter Gourd', 'Pumpkin'], sandy: ['Moong Dal', 'Watermelon'] },
  };
  const soil = soilType?.toLowerCase() || 'loamy';
  const s = season?.toLowerCase() || 'kharif';
  const recommended = crops[s]?.[soil] || crops.kharif.loamy;
  return {
    primaryCrop: recommended[0], alternativeCrops: recommended.slice(1),
    season: isHi ? (s === 'kharif' ? 'खरीफ' : s === 'rabi' ? 'रबी' : 'जायद') : s,
    sowingTime: isHi ? (s === 'kharif' ? 'जून–जुलाई' : s === 'rabi' ? 'अक्टूबर–नवंबर' : 'मार्च–अप्रैल') : (s === 'kharif' ? 'June–July' : s === 'rabi' ? 'October–November' : 'March–April'),
    harvestTime: isHi ? (s === 'kharif' ? 'अक्टूबर–नवंबर' : s === 'rabi' ? 'मार्च–अप्रैल' : 'जून') : (s === 'kharif' ? 'October–November' : s === 'rabi' ? 'March–April' : 'June'),
    waterRequirement: isHi ? (rainfall > 800 ? 'उच्च' : rainfall > 400 ? 'मध्यम' : 'कम') : (rainfall > 800 ? 'High' : rainfall > 400 ? 'Medium' : 'Low'),
    fertilizers: isHi ? ['यूरिया (N)', 'डीएपी (P)', 'एमओपी (K)'] : ['Urea (N)', 'DAP (P)', 'MOP (K)'],
    tips: isHi ? ['Best suited soil', 'Certified seeds', 'Split fertilizer', 'Pest monitoring'] : ['Best soil', 'Seeds', 'Fertilizer', 'Pests'],
    isFallback: true
  };
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const endpoint = req.url.split('?')[0].split('/').pop();

  try {
    if (req.method === 'POST' && endpoint === 'recommend') {
      const { soilType, temperature, rainfall, season, state, language = 'en' } = req.body;
      const cacheKey = `crop:rec:${soilType}:${season}:${state}:${Math.round(temperature)}:${language}`;
      
      let cached = null;
      if (redis) cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

      let recommendation;
      if (openai) {
        const isHi = language.startsWith('hi');
        const prompt = `Indian Farmer Advisor. Recommend crops for: ${soilType}, ${temperature}C, ${rainfall}mm, ${season}, ${state}. Language: ${isHi ? 'Hindi' : 'English'}. Return JSON with English keys: primaryCrop, alternativeCrops, season, sowingTime, harvestTime, waterRequirement, fertilizers, tips, expectedYield, marketDemand. Values in ${isHi ? 'Hindi' : 'English'}.`;
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" }
        });
        recommendation = JSON.parse(completion.choices[0].message.content);
      } else {
        recommendation = getRuleBasedRecommendation(req.body);
      }

      if (redis) await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(recommendation)).catch(() => {});
      return res.json({ success: true, data: recommendation });
    }

    if (req.method === 'GET' && endpoint === 'calendar') {
      const { crop, state = 'Punjab', lang = 'en' } = req.query;
      const isHi = lang?.startsWith('hi');
      const calendar = {
        crop, state,
        activities: [
          { month: isHi ? 'अक्टूबर' : 'October', activity: isHi ? 'भूमि की तैयारी' : 'Land Preparation', notes: isHi ? 'प्रमाणित बीज' : 'Use certified seeds' },
          { month: isHi ? 'मार्च' : 'March', activity: isHi ? 'कटाई' : 'Harvest', notes: isHi ? 'नमी < 12%' : 'Moisture < 12%' }
        ]
      };
      return res.json({ success: true, data: calendar });
    }

    res.status(404).json({ success: false, message: 'Endpoint not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
