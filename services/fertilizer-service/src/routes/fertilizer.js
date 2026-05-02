const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const axios = require('axios'); // We'll use axios for direct API calls
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
    const apiKey = process.env.GEMINI_API_KEY;

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

    if (!apiKey) {
      console.warn('No GEMINI_API_KEY found, using mock data.');
      analysisResult = getMockAnalysis();
    } else {
        const prompt = `You are an expert agricultural plant pathologist. Analyze this plant/crop image. Return ONLY valid JSON: { "primaryIssue": { "deficiency": "name", "severity": "Mild|Moderate|Severe", "symptoms": "desc", "treatment": "steps", "prevention": "tips", "confidence": 0-100 }, "additionalIssues": [], "overallHealth": "Good|Fair|Poor", "urgency": "time", "generalRecommendations": ["tip1", "tip2"] }`;

        // Direct API Call to Google (v1 endpoint)
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        try {
            console.log('Direct Detective: Calling Google v1 API...');
            const response = await axios.post(url, {
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/webp", data: optimizedBuffer.toString('base64') } }
                    ]
                }]
            });

            if (response.data && response.data.candidates && response.data.candidates[0].content) {
                const text = response.data.candidates[0].content.parts[0].text;
                const cleanJson = text.replace(/```json|```/g, '').trim();
                analysisResult = JSON.parse(cleanJson);
                analysisResult.isMock = false;
                console.log('Success with Direct v1 API!');
            }
        } catch (err) {
            console.error('Direct v1 API failed:', err.response?.data || err.message);
            
            // Try one more: gemini-pro-vision on v1
            try {
                console.log('Direct Detective: Trying gemini-pro-vision v1...');
                const url2 = `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${apiKey}`;
                const resp2 = await axios.post(url2, {
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inline_data: { mime_type: "image/webp", data: optimizedBuffer.toString('base64') } }
                        ]
                    }]
                });
                const text2 = resp2.data.candidates[0].content.parts[0].text;
                const cleanJson2 = text2.replace(/```json|```/g, '').trim();
                analysisResult = JSON.parse(cleanJson2);
                analysisResult.isMock = false;
                console.log('Success with gemini-pro-vision v1!');
            } catch (err2) {
                console.error('All Direct attempts failed.');
                analysisResult = getMockAnalysis();
            }
        }
    }

    if (!analysisResult) analysisResult = getMockAnalysis();

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

// Mock analysis for fallback
const getMockAnalysis = () => ({
  primaryIssue: {
    deficiency: 'Nitrogen (N) Deficiency',
    severity: 'Moderate',
    symptoms: 'Yellowing of older leaves starting from tip',
    treatment: 'Apply Urea @ 30kg/acre',
    prevention: 'Balanced fertilization',
    confidence: 78,
  },
  additionalIssues: [],
  overallHealth: 'Fair',
  urgency: 'Within 7 days',
  generalRecommendations: ['Check soil moisture', 'Test pH'],
  isMock: true
});

// GET /fertilizer/soil/map-markers
router.get('/soil/map-markers', async (req, res) => {
  try {
    const regionalSoil = [
      { lat: 21.1458, lng: 79.0882, title: 'Nagpur Region', info: 'Black Cotton Soil' },
      { lat: 24.5333, lng: 81.3000, title: 'Rewa District', info: 'Mixed Red and Black Soil' }
    ];
    res.json({ success: true, data: regionalSoil.map(s => ({ ...s, type: 'soil' })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
