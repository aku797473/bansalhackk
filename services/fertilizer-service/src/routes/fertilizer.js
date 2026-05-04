const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const Groq = require('groq-sdk');
const FertilizerHistory = require('../models/FertilizerHistory');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null
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

    let analysisResult = null;

    if (!groq) {
      console.warn('No GROQ_API_KEY found, using mock.');
      analysisResult = getMockAnalysis();
    } else {
        const prompt = `You are an expert agricultural scientist and plant pathologist. 
Analyze this image which could be a plant, crop, or seeds.
Identify:
1. Seed variety and quality (if seeds are shown)
2. Nutrient deficiencies or diseases (if a plant is shown)
3. Soil report details (if a document is shown)

Return ONLY valid JSON in this format:
{
  "primaryIssue": {
    "deficiency": "Name of Seed/Disease/Deficiency",
    "severity": "High|Moderate|Low Quality/Severity",
    "symptoms": "Description of what is seen",
    "treatment": "Actionable steps (e.g., Use this fertilizer or This seed is good for planting)",
    "prevention": "Tips for future",
    "confidence": 0-100
  },
  "additionalIssues": [],
  "overallHealth": "Good|Fair|Poor",
  "urgency": "Immediate|Monitor",
  "generalRecommendations": ["tip1", "tip2"]
}`;

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
            analysisResult = getMockAnalysis();
        }
    }

    if (!analysisResult) analysisResult = getMockAnalysis();

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

const getMockAnalysis = () => ({
  primaryIssue: {
    deficiency: 'Nitrogen (N) Deficiency',
    severity: 'Moderate',
    symptoms: 'Yellowing of older leaves',
    treatment: 'Apply Urea',
    prevention: 'Soil testing',
    confidence: 78,
  },
  additionalIssues: [],
  overallHealth: 'Fair',
  urgency: 'Within 7 days',
  generalRecommendations: ['Monitor growth', 'Check water'],
  isMock: true
});

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
