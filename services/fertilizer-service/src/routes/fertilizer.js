const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const FertilizerHistory = require('../models/FertilizerHistory');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only image and PDF files allowed'), false);
  },
});

// Gemini Setup
console.log('--- Fertilizer AI Check ---');
console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Mock analysis for demo
const getMockAnalysis = () => {
  return {
    primaryIssue: {
      deficiency: 'Nitrogen (N) Deficiency',
      severity: 'Moderate',
      symptoms: 'Yellowing of older/lower leaves starting from leaf tip, stunted growth',
      treatment: 'Apply Urea @ 30-40 kg/acre or top-dress with 25 kg Urea/acre',
      prevention: 'Split nitrogen applications, use slow-release fertilizers',
      confidence: 78,
    },
    additionalIssues: [],
    overallHealth: 'Fair',
    urgency: 'Act within 7-10 days',
    generalRecommendations: [
      'Ensure adequate drainage to prevent waterlogging',
      'Test soil pH and adjust if needed (target 6.0–6.5)',
      'Apply organic matter to improve nutrient availability',
      'Irrigate appropriately — avoid both over and under watering',
    ],
    isMock: true,
  };
};

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

    let optimizedBuffer;
    try {
      optimizedBuffer = await sharp(req.file.buffer)
        .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch (e) {
      optimizedBuffer = req.file.buffer;
    }

    let analysisResult = null;

    if (!genAI) {
      analysisResult = getMockAnalysis();
    } else {
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro-vision"];
        const prompt = `You are an expert agricultural plant pathologist. Analyze this plant/crop image. Return ONLY valid JSON: { "primaryIssue": { "deficiency": "name", "severity": "Mild|Moderate|Severe", "symptoms": "desc", "treatment": "steps", "prevention": "tips", "confidence": 0-100 }, "additionalIssues": [], "overallHealth": "Good|Fair|Poor", "urgency": "time", "generalRecommendations": ["tip1", "tip2"] }`;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying Gemini model: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent([
                    prompt,
                    { inlineData: { data: optimizedBuffer.toString('base64'), mimeType: 'image/webp' } }
                ]);
                const response = await result.response;
                const text = response.text();
                const cleanJson = text.replace(/```json|```/g, '').trim();
                analysisResult = JSON.parse(cleanJson);
                analysisResult.isMock = false;
                console.log(`Success with model: ${modelName}`);
                break; // Exit loop on success
            } catch (err) {
                console.error(`Model ${modelName} failed:`, err.message);
                continue; // Try next model
            }
        }
    }

    if (!analysisResult) {
        console.warn('All Gemini models failed, using mock data.');
        analysisResult = getMockAnalysis();
    }

    // Save history asynchronously
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

// GET /fertilizer/soil/map-markers
router.get('/soil/map-markers', async (req, res) => {
  try {
    const regionalSoil = [
      { lat: 21.1458, lng: 79.0882, title: 'Nagpur Region', info: 'Black Cotton Soil · High Clay', detail: 'pH: 7.8 · Organic Carbon: 0.6% · Suitable: Cotton, Oranges' },
      { lat: 15.3173, lng: 75.7139, title: 'Gadag Belt', info: 'Red Loamy Soil · Moderate Drainage', detail: 'pH: 6.5 · Organic Carbon: 0.4% · Suitable: Groundnut, Chillies' },
      { lat: 27.1767, lng: 77.4126, title: 'Bharatpur Area', info: 'Alluvial Soil · Highly Fertile', detail: 'pH: 7.0 · Organic Carbon: 0.8% · Suitable: Wheat, Mustard' },
      { lat: 20.9374, lng: 85.0985, title: 'Odisha Plains', info: 'Laterite Soil · Acidic', detail: 'pH: 5.8 · Organic Carbon: 0.3% · Suitable: Cashew, Tea' },
      { lat: 24.5333, lng: 81.3000, title: 'Rewa District', info: 'Mixed Red and Black Soil', detail: 'pH: 7.2 · Organic Carbon: 0.5% · Suitable: Wheat, Gram' },
      { lat: 31.1471, lng: 75.3412, title: 'Jalandhar Basin', info: 'Sandy Loam · Alluvial', detail: 'pH: 7.4 · Organic Carbon: 0.7% · Suitable: Wheat, Rice, Potato' },
    ];
    res.json({ success: true, data: regionalSoil.map(s => ({ ...s, type: 'soil' })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
