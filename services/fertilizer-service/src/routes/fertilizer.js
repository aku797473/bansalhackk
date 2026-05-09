const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const Groq = require('groq-sdk');
const FertilizerHistory = require('../models/FertilizerHistory');
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

redis.on('connect', () => {
  console.log('✅ Redis Connected to Upstash (Fertilizer Service)');
});

redis.on('error', (err) => console.warn('⚠️  Redis not available in Fertilizer Service:', err.message));

const storage = multer.memoryStorage();
// ... (rest of multer setup)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only image and PDF files allowed'), false);
  },
});

// Groq Setup
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// GET /fertilizer/history
router.get('/history', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const history = await FertilizerHistory.find({ userId }).sort({ timestamp: -1 }).limit(20);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /fertilizer/analyze
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File required' });
    }

    const userId = req.headers['x-user-id'] || 'anonymous';

    // Optimize image for Vision
    let optimizedBuffer;
    try {
      optimizedBuffer = await sharp(req.file.buffer)
        .resize(800, 800, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (e) {
      optimizedBuffer = req.file.buffer;
    }

    const { language = 'en' } = req.body;

    let analysisResult = null;

    if (!groq) {
      console.warn('No GROQ_API_KEY found, using mock.');
      analysisResult = getMockAnalysis(language);
    } else {
        const isHi = language?.startsWith('hi');
        const langName = isHi ? 'Hindi (in Devanagari script)' : 'English';
        const prompt = `You are an expert agricultural scientist and plant pathologist. 
Analyze this image which could be a plant, crop, seeds, or a soil report document.
Provide a highly detailed, professional agricultural analysis.

Return ONLY valid JSON in this format (JSON KEYS MUST REMAIN IN ENGLISH):
{
  "cropType": "Identified crop or plant type",
  "primaryIssue": {
    "deficiency": "Specific Name of Disease / Nutrient Deficiency / Seed Quality",
    "severity": "High|Moderate|Low",
    "symptoms": "Detailed scientific description of visual symptoms",
    "treatment": "Immediate actionable chemical or organic treatment steps",
    "prevention": "Long-term cultural and preventative strategies",
    "confidence": 85
  },
  "npkEstimates": {
    "N": "Low|Medium|High",
    "P": "Low|Medium|High",
    "K": "Low|Medium|High"
  },
  "recommendedFertilizers": [
    { "name": "Fertilizer Name", "dosage": "Recommended dosage/acre", "timing": "When to apply" }
  ],
  "overallHealth": "Good|Fair|Poor",
  "urgency": "Immediate|Monitor|Routine",
  "generalRecommendations": ["Detailed scientific tip 1", "Detailed tip 2"]
}

CRITICAL REQUIREMENT: 
You MUST provide all string VALUES for all descriptive fields (cropType, deficiency, symptoms, treatment, prevention, generalRecommendations, name, dosage, timing) STRICTLY AND ONLY in ${langName}. 
Do NOT mix languages. Do NOT use English words in the values if Hindi is requested. Translate everything fully into ${langName}.`;

        try {
            console.log('Attempting Groq Vision Analysis (Llama 4 Scout)...');
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`,
                                },
                            },
                        ],
                    },
                ],
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0].message.content;
            analysisResult = JSON.parse(content);
            analysisResult.isMock = false;
            console.log('Groq Vision Success!');
        } catch (err) {
            console.error('Groq Vision failed:', err.message);
            analysisResult = getMockAnalysis(language);
        }
    }

    if (!analysisResult) analysisResult = getMockAnalysis(language);

    // Save history
    FertilizerHistory.create({
      userId,
      primaryIssue: analysisResult.primaryIssue,
      overallHealth: analysisResult.overallHealth,
      urgency: analysisResult.urgency
    }).catch(console.error);

    res.json({ success: true, data: analysisResult });
  } catch (err) {
    console.error('Fertilizer analyze error:', err);
    res.status(500).json({ success: false, message: 'Analysis failed' });
  }
});

const getMockAnalysis = (lang = 'en') => {
  const isHi = lang?.startsWith('hi');
  return {
    cropType: isHi ? 'गेहूँ (Wheat)' : 'Wheat',
    primaryIssue: {
      deficiency: isHi ? 'नाइट्रोजन (N) की गंभीर कमी' : 'Severe Nitrogen (N) Deficiency',
      severity: 'High',
      symptoms: isHi ? 'निचली और पुरानी पत्तियों का व्यापक रूप से पीला पड़ना, पौधों का विकास रुक जाना।' : 'Widespread yellowing of lower/older leaves, stunted plant growth.',
      treatment: isHi ? 'प्रति एकड़ 40-50 किलो यूरिया का तत्काल छिड़काव करें। 2% यूरिया के घोल का पर्णीय छिड़काव भी किया जा सकता है।' : 'Immediate broadcast of 40-50 kg Urea per acre. Foliar spray of 2% Urea solution can also be applied.',
      prevention: isHi ? 'बुवाई से पहले मिट्टी परीक्षण करवाएं। हरी खाद (ढैंचा/मूंग) का उपयोग करें।' : 'Conduct soil testing before sowing. Use green manure (Dhaincha/Moong) to improve soil health.',
      confidence: 92,
    },
    npkEstimates: {
      N: 'Low',
      P: 'Medium',
      K: 'Medium'
    },
    recommendedFertilizers: [
      {
        name: isHi ? 'यूरिया (46% N)' : 'Urea (46% N)',
        dosage: isHi ? '45 किग्रा/एकड़' : '45 kg/acre',
        timing: isHi ? 'सिंचाई के बाद (शीर्ष ड्रेसिंग)' : 'After irrigation (Top dressing)'
      },
      {
        name: isHi ? 'जिंक सल्फेट' : 'Zinc Sulphate',
        dosage: isHi ? '10 किग्रा/एकड़' : '10 kg/acre',
        timing: isHi ? 'बुवाई के समय' : 'At sowing time'
      }
    ],
    overallHealth: 'Poor',
    urgency: 'Immediate',
    generalRecommendations: isHi 
      ? ['खेत में उचित नमी बनाए रखें।', 'फसल चक्र अपनाएं, अगली बार फलीदार फसल बोएं।', 'खरपतवार नियंत्रण समय पर करें।'] 
      : ['Maintain proper moisture in the field.', 'Adopt crop rotation, sow leguminous crops next season.', 'Control weeds timely to reduce nutrient competition.'],
    isMock: true
  };
};

// GET /fertilizer/soil/map-markers
router.get('/soil/map-markers', async (req, res) => {
  try {
    const cacheKey = 'fertilizer:soil:map-markers';
    const isRedisReady = redis.status === 'ready';
    if (isRedisReady) {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    const regionalSoil = [
      { lat: 21.1458, lng: 79.0882, title: 'Nagpur Region', info: 'Black Cotton Soil' },
      { lat: 24.5333, lng: 81.3000, title: 'Rewa District', info: 'Mixed Red and Black Soil' }
    ];
    const result = regionalSoil.map(s => ({ ...s, type: 'soil' }));

    if (isRedisReady) {
      await redis.setex(cacheKey, 86400, JSON.stringify(result)).catch(() => {});
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
