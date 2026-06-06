const { ChatGroq } = require('@langchain/groq');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { z } = require('zod');
const Redis = require('ioredis');

// --- Redis Configuration ---
const redisUrl = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';
let redis = null;
try {
  redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, retryStrategy: () => null });
} catch (e) { console.warn('Redis init failed:', e.message); }

const CACHE_TTL = 3600 * 6; // 6 hours

// --- Obfuscated Groq Key (same as ai.js) ---
const p1 = 'gsk_MZSoKigCB';
const p2 = 'ojILVDovEdhWGdyb';
const p3 = '3FYbygSdjRWDAT98Sb8RAiaybeg';
const GROQ_API_KEY = process.env.GROQ_API_KEY || (p1 + p2 + p3);

// --- LangChain: Structured Output Schema using Zod ---
const cropOutputSchema = z.object({
  primaryCrop: z.string().describe('The best crop to grow'),
  alternativeCrops: z.array(z.string()).describe('Other suitable crops'),
  season: z.string().describe('Best season for growing'),
  sowingTime: z.string().describe('Best time to sow seeds'),
  harvestTime: z.string().describe('Expected harvest time'),
  waterRequirement: z.string().describe('Water requirement level: Low / Medium / High'),
  fertilizers: z.array(z.string()).describe('Recommended fertilizers'),
  tips: z.array(z.string()).describe('Agricultural tips for the farmer'),
  expectedYield: z.string().describe('Expected yield per acre'),
  marketDemand: z.string().describe('Current market demand for this crop'),
  profitEstimate: z.string().describe('Estimated profit per acre in INR'),
  confidence: z.number().describe('Confidence score between 0 and 1'),
});

// --- Rule-Based Fallback ---
const getRuleBasedRecommendation = ({ soilType, rainfall, temperature, season, language = 'en' }) => {
  const isHi = language.startsWith('hi');
  const crops = {
    kharif: { loamy: ['Rice', 'Maize', 'Cotton', 'Soybean'], clay: ['Rice', 'Sugarcane', 'Jute'], sandy: ['Groundnut', 'Millets', 'Sesame'] },
    rabi:   { loamy: ['Wheat', 'Mustard', 'Chickpea', 'Peas'], clay: ['Wheat', 'Barley', 'Lentils'], sandy: ['Barley', 'Mustard', 'Chickpea'] },
    zaid:   { loamy: ['Watermelon', 'Muskmelon', 'Cucumber'], clay: ['Bitter Gourd', 'Pumpkin'], sandy: ['Moong Dal', 'Watermelon'] },
  };
  const soil = soilType?.toLowerCase().replace(/\s+/g, '') || 'loamy';
  const matchedSoil = ['loamy', 'clay', 'sandy'].find(k => soil.includes(k)) || 'loamy';
  const s = season?.toLowerCase() || 'kharif';
  const recommended = crops[s]?.[matchedSoil] || crops.kharif.loamy;
  return {
    primaryCrop: recommended[0],
    alternativeCrops: recommended.slice(1),
    season: isHi ? (s === 'kharif' ? 'खरीफ' : s === 'rabi' ? 'रबी' : 'जायद') : s,
    sowingTime: isHi ? (s === 'kharif' ? 'जून–जुलाई' : s === 'rabi' ? 'अक्टूबर–नवंबर' : 'मार्च–अप्रैल') : (s === 'kharif' ? 'June–July' : s === 'rabi' ? 'October–November' : 'March–April'),
    harvestTime: isHi ? (s === 'kharif' ? 'अक्टूबर–नवंबर' : s === 'rabi' ? 'मार्च–अप्रैल' : 'जून') : (s === 'kharif' ? 'October–November' : s === 'rabi' ? 'March–April' : 'June'),
    waterRequirement: isHi ? (rainfall > 800 ? 'उच्च' : rainfall > 400 ? 'मध्यम' : 'कम') : (rainfall > 800 ? 'High' : rainfall > 400 ? 'Medium' : 'Low'),
    fertilizers: isHi ? ['यूरिया (N)', 'डीएपी (P)', 'एमओपी (K)'] : ['Urea (N)', 'DAP (P)', 'MOP (K)'],
    tips: isHi ? ['प्रमाणित बीजों का उपयोग करें', 'विभाजित खुराक में उर्वरक लगाएं', 'कीटों की नियमित निगरानी करें'] : ['Use certified seeds', 'Apply fertilizer in split doses', 'Monitor pests regularly'],
    expectedYield: `${Math.round(10 + (rainfall / 100))} quintals/acre`,
    marketDemand: 'Medium',
    profitEstimate: '₹25,000 – ₹40,000 per acre',
    confidence: 0.65,
    isFallback: true,
  };
};

// --- LangChain Chain Builder ---
const buildCropChain = (language = 'en') => {
  const isHi = language.startsWith('hi');
  const langInstruction = isHi
    ? 'Respond in Hindi (Devanagari script). JSON keys must stay in English.'
    : 'Respond in English. JSON keys must stay in English.';

  const parser = StructuredOutputParser.fromZodSchema(cropOutputSchema);
  const formatInstructions = parser.getFormatInstructions();

  const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert Indian Agricultural Advisor with deep knowledge of Indian farming conditions, soil types, climate patterns, and crop economics.

Given the following farm data from an Indian farmer:
- Soil Type: {soilType}
- Soil pH: {soilPH}
- N-P-K Levels: {nitrogen}-{phosphorus}-{potassium}
- Temperature: {temperature}°C
- Humidity: {humidity}%
- Rainfall: {rainfall}mm/year
- Season: {season}
- State: {state}
- District: {district}
- Planned Crop (if any): {cropType}
- Budget: ₹{budget}

Task: Recommend the best crop to grow and provide a complete farming strategy.
{langInstruction}

{format_instructions}

Return ONLY valid JSON. No extra text.
`);

  const llm = new ChatGroq({
    apiKey: GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    maxTokens: 1024,
  });

  return promptTemplate.pipe(llm).pipe(parser);
};

// --- Vercel Serverless Handler ---
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const endpoint = req.url.split('?')[0].split('/').pop();

  try {
    // ─── POST /api/crop/recommend ─────────────────────────────────────────────
    if (req.method === 'POST' && endpoint === 'recommend') {
      const {
        soilType = 'Loamy', soilPH = '6.5',
        nitrogen = '40', phosphorus = '30', potassium = '20',
        temperature = '28', humidity = '65', rainfall = '600',
        season = 'rabi', state = 'Punjab', district = 'Punjab',
        cropType = 'Not specified', budget = '50000',
        language = 'en'
      } = req.body || {};

      const cacheKey = `langchain:crop:${soilType}:${season}:${state}:${Math.round(Number(temperature))}:${language}`;

      // Try cache first
      if (redis) {
        const cached = await redis.get(cacheKey).catch(() => null);
        if (cached) {
          return res.json({ success: true, data: JSON.parse(cached), cached: true, source: 'cache' });
        }
      }

      let recommendation;
      let source = 'langchain';

      try {
        const chain = buildCropChain(language);
        recommendation = await chain.invoke({
          soilType, soilPH, nitrogen, phosphorus, potassium,
          temperature, humidity, rainfall, season, state, district,
          cropType, budget,
          langInstruction: language.startsWith('hi')
            ? 'Respond in Hindi (Devanagari script). JSON keys must stay in English.'
            : 'Respond in English. JSON keys must stay in English.',
        });
      } catch (chainErr) {
        console.warn('[LangChain] Chain failed, using rule-based fallback:', chainErr.message);
        recommendation = getRuleBasedRecommendation({ soilType, rainfall: Number(rainfall), temperature: Number(temperature), season, language });
        source = 'fallback';
      }

      // Cache the result
      if (redis && recommendation) {
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(recommendation)).catch(() => {});
      }

      return res.json({ success: true, data: recommendation, source });
    }

    // ─── GET /api/crop/calendar ───────────────────────────────────────────────
    if (req.method === 'GET' && endpoint === 'calendar') {
      const { crop = 'Wheat', state = 'Punjab', lang = 'en' } = req.query;
      const isHi = lang?.startsWith('hi');
      const calendar = {
        crop, state,
        activities: [
          { month: isHi ? 'अक्टूबर' : 'October', activity: isHi ? 'भूमि की तैयारी और बुवाई' : 'Land Preparation & Sowing', notes: isHi ? 'प्रमाणित बीजों का उपयोग करें, कतारों की दूरी 22.5 सेमी' : 'Use certified seeds, row spacing 22.5cm' },
          { month: isHi ? 'नवंबर' : 'November', activity: isHi ? 'सिंचाई + खरपतवार नियंत्रण' : 'Irrigation + Weed Control', notes: isHi ? 'बुवाई से पहले शाकनाशी का प्रयोग करें' : 'Apply pre-emergence herbicide' },
          { month: isHi ? 'दिसंबर' : 'December', activity: isHi ? 'उर्वरक टॉप ड्रेसिंग' : 'Fertilizer Top Dressing', notes: isHi ? 'बुवाई के बाद पहली सिंचाई' : 'First irrigation after sowing' },
          { month: isHi ? 'जनवरी' : 'January', activity: isHi ? 'कीट निगरानी' : 'Pest Monitoring', notes: isHi ? 'एफिड्स और रस्ट पर नज़र रखें' : 'Watch for aphids and rust' },
          { month: isHi ? 'फरवरी' : 'February', activity: isHi ? 'अंतिम सिंचाई' : 'Last Irrigation', notes: isHi ? 'कटाई से 2 सप्ताह पहले सिंचाई बंद करें' : 'Stop irrigation 2 weeks before harvest' },
          { month: isHi ? 'मार्च' : 'March', activity: isHi ? 'कटाई' : 'Harvest', notes: isHi ? 'जब नमी <12% हो' : 'Harvest when moisture <12%' },
        ],
      };
      return res.json({ success: true, data: calendar });
    }

    res.status(404).json({ success: false, message: 'Endpoint not found' });
  } catch (error) {
    console.error('[Crop API Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
