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

redis.on('connect', () => {
  console.log('✅ Redis Connected to Upstash (Crop Service)');
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
const getRuleBasedRecommendation = ({ soilType, rainfall, temperature, season, state, language = 'en' }) => {
  const isHi = language === 'hi';
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
    season: isHi ? (s === 'kharif' ? 'खरीफ' : s === 'rabi' ? 'रबी' : 'जायद') : s,
    sowingTime: isHi 
      ? (s === 'kharif' ? 'जून–जुलाई' : s === 'rabi' ? 'अक्टूबर–नवंबर' : 'मार्च–अप्रैल')
      : (s === 'kharif' ? 'June–July' : s === 'rabi' ? 'October–November' : 'March–April'),
    harvestTime: isHi
      ? (s === 'kharif' ? 'अक्टूबर–नवंबर' : s === 'rabi' ? 'मार्च–अप्रैल' : 'जून')
      : (s === 'kharif' ? 'October–November' : s === 'rabi' ? 'March–April' : 'June'),
    waterRequirement: isHi
      ? (rainfall > 800 ? 'उच्च' : rainfall > 400 ? 'मध्यम' : 'कम')
      : (rainfall > 800 ? 'High' : rainfall > 400 ? 'Medium' : 'Low'),
    fertilizers: isHi ? ['यूरिया (N)', 'डीएपी (P)', 'एमओपी (K)'] : ['Urea (N)', 'DAP (P)', 'MOP (K)'],
    tips: isHi ? [
      `${isHi ? (soil === 'loamy' ? 'दोमट' : soil === 'clay' ? 'चिकनी' : 'बलुई') : soil} मिट्टी में ${isHi ? (s === 'kharif' ? 'खरीफ' : s === 'rabi' ? 'रबी' : 'जायद') : s} सीजन के लिए सबसे उपयुक्त`,
      'सरकारी अनुमोदित स्रोतों से प्रमाणित बीजों का उपयोग करें',
      'विभाजित अनुप्रयोगों में उर्वरक की अनुशंसित खुराक लागू करें',
      'हर 10-15 दिनों में कीटों की निगरानी करें',
    ] : [
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
}

IMPORTANT: Provide all text content (primaryCrop, alternativeCrops, sowingTime, harvestTime, fertilizers, tips, expectedYield) in ${req.body.language === 'hi' ? 'Hindi' : 'English'}.
`;

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
    const { crop, state = 'Punjab', lang = 'en' } = req.query;
    if (!crop) return res.status(400).json({ success: false, message: 'crop is required' });

    const cacheKey = `crop:calendar:${crop.toLowerCase()}:${state.toLowerCase()}:${lang}`;
    const isRedisReady = redis.status === 'ready';
    if (isRedisReady) {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    const isHi = lang === 'hi';
    const calendar = {
      crop, state,
      activities: [
        { month: isHi ? 'अक्टूबर' : 'October',  activity: isHi ? 'भूमि की तैयारी और बुवाई' : 'Land Preparation & Sowing',     notes: isHi ? 'प्रमाणित बीजों का उपयोग करें, कतारों की दूरी 22.5 सेमी' : 'Use certified seeds, row spacing 22.5cm' },
        { month: isHi ? 'नवंबर' : 'November', activity: isHi ? 'सिंचाई #1 + खरपतवार नियंत्रण' : 'Irrigation #1 + Weed Control',  notes: isHi ? 'बुवाई से पहले शाकनाशी का प्रयोग करें' : 'Apply pre-emergence herbicide' },
        { month: isHi ? 'दिसंबर' : 'December', activity: isHi ? 'उर्वरक टॉप ड्रेसिंग (यूरिया)' : 'Fertilizer Top Dressing (Urea)', notes: isHi ? 'बुवाई के बाद पहली सिंचाई' : 'First irrigation after sowing' },
        { month: isHi ? 'जनवरी' : 'January',  activity: isHi ? 'सिंचाई #3 + कीट निगरानी' : 'Irrigation #3 + Pest Monitoring', notes: isHi ? 'एफिड्स और रस्ट पर नज़र रखें' : 'Watch for aphids and rust' },
        { month: isHi ? 'फरवरी' : 'February', activity: isHi ? 'अंतिम सिंचाई + परिपक्वता' : 'Last Irrigation + Maturity',    notes: isHi ? 'कटाई से 2 सप्ताह पहले सिंचाई बंद कर दें' : 'Stop irrigation 2 weeks before harvest' },
        { month: isHi ? 'मार्च' : 'March',    activity: isHi ? 'कटाई' : 'Harvest',                        notes: isHi ? 'जब नमी < 12% हो तब कटाई करें' : 'Harvest when moisture < 12%' },
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
