const express = require('express');
const router = express.Router();
const Redis = process.env.MOCK_REDIS_KAFKA === 'true' ? require('../../../../utils/mockRedis') : require('ioredis');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Redis Connection Logic - Prioritize local Docker network
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    if (times > 1) return null; 
    return 100;
  },
  connectTimeout: 2000, 
});

redis.on('connect', () => console.log('✅ Redis Connected (Crop Service)'));
redis.on('error', (err) => console.warn('⚠️ Redis not available in Crop Service:', err.message));

const CACHE_TTL = 60 * 60 * 12; // 12 hours

// Gemini AI Setup - Using GEMINI_API_KEY as per docker-compose
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Rule-based fallback crop recommendation
const getRuleBasedRecommendation = ({ soilType, rainfall, temperature, season, state, language = 'en' }) => {
  const isHi = language.startsWith('hi');
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
      language = 'en'
    } = req.body;

    const cacheKey = `crop:rec:${soilType}:${season}:${state}:${Math.round(temperature)}:${language}`;
    
    // Attempt cache lookup
    if (redis.status === 'ready') {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
      } catch (err) {
        console.warn('Cache lookup failed:', err.message);
      }
    }

    let recommendation;

    if (genAI) {
      const isHi = language.startsWith('hi');
      const langName = isHi ? 'Hindi (in Devanagari script)' : 'English';
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are a professional Indian agricultural advisor.
Given this data:
Soil: ${soilType}, pH: ${soilPH}, N-P-K: ${nitrogen}-${phosphorus}-${potassium}
Climate: ${temperature}°C, ${humidity}% Humidity, ${rainfall}mm Rainfall
Season: ${season}, Location: ${district}, ${state}

Recommend crops in valid JSON (KEYS MUST BE ENGLISH, VALUES IN ${langName}):
{
  "primaryCrop": "string",
  "alternativeCrops": ["string"],
  "season": "string",
  "sowingTime": "string",
  "harvestTime": "string",
  "waterRequirement": "${isHi ? 'कम|मध्यम|उच्च' : 'Low|Medium|High'}",
  "fertilizers": ["string"],
  "tips": ["string"],
  "expectedYield": "string",
  "confidence": 0.95
}
Return ONLY the JSON object.`;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        recommendation = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch (err) {
        console.warn('Gemini API failed, using rule-based fallback:', err.message);
        recommendation = getRuleBasedRecommendation(req.body);
      }
    } else {
      console.warn('GEMINI_API_KEY missing, using rule-based fallback.');
      recommendation = getRuleBasedRecommendation(req.body);
    }

    // Cache the result
    if (redis.status === 'ready') {
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

    const isHi = lang?.startsWith('hi');
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
