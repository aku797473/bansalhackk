const mongoose = require('mongoose');
const Groq = require('groq-sdk');
const Busboy = require('busboy');
const sharp = require('sharp');

// --- MongoDB Configuration ---
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  cachedDb = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return cachedDb;
}

const FertilizerHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  primaryIssue: { type: Object },
  overallHealth: { type: String },
  urgency: { type: String },
  timestamp: { type: Date, default: Date.now }
});
const FertilizerHistory = mongoose.models.FertilizerHistory || mongoose.model('FertilizerHistory', FertilizerHistorySchema);

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const getMockAnalysis = (lang = 'en') => {
  const isHi = lang?.startsWith('hi');
  return {
    primaryIssue: {
      deficiency: isHi ? 'नाइट्रोजन (N) की कमी' : 'Nitrogen (N) Deficiency',
      severity: 'Moderate',
      symptoms: isHi ? 'पुरानी पत्तियों का पीला पड़ना' : 'Yellowing of older leaves',
      treatment: isHi ? 'यूरिया (Urea) का प्रयोग करें' : 'Apply Urea',
      prevention: isHi ? 'मिट्टी का परीक्षण करवाएं' : 'Soil testing',
      confidence: 78
    },
    overallHealth: 'Fair', urgency: 'Within 7 days', isMock: true
  };
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectToDatabase().catch(() => {});

  const endpoint = req.url.split('?')[0].split('/').pop();

  try {
    if (req.method === 'GET' && endpoint === 'history') {
      const userId = req.headers['x-user-id'] || 'anonymous';
      if (mongoose.connection.readyState !== 1) return res.json({ success: true, data: [] });
      const history = await FertilizerHistory.find({ userId }).sort({ timestamp: -1 }).limit(10);
      return res.json({ success: true, data: history });
    }

    if (req.method === 'GET' && endpoint === 'map-markers') {
      const regionalSoil = [
        { lat: 21.1458, lng: 79.0882, title: 'Nagpur Region', info: 'Black Cotton Soil', type: 'soil' },
        { lat: 24.5333, lng: 81.3000, title: 'Rewa District', info: 'Mixed Red and Black Soil', type: 'soil' }
      ];
      return res.json({ success: true, data: regionalSoil });
    }

    if (req.method === 'POST' && endpoint === 'analyze') {
      return new Promise((resolve) => {
        const busboy = Busboy({ headers: req.headers });
        let fileBuffer = null;
        let language = 'en';

        busboy.on('file', (name, file) => {
          const chunks = [];
          file.on('data', (chunk) => chunks.push(chunk));
          file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
        });

        busboy.on('field', (name, val) => {
          if (name === 'language') language = val;
        });

        busboy.on('finish', async () => {
          try {
            if (!fileBuffer) return resolve(res.status(400).json({ success: false, message: 'No file' }));

            let analysisResult;
            if (!groq) {
              analysisResult = getMockAnalysis(language);
            } else {
              // Image optimization
              const optimized = await sharp(fileBuffer).resize(800, 800, { fit: 'inside' }).jpeg({ quality: 80 }).toBuffer().catch(() => fileBuffer);
              
              const prompt = `Agricultural AI. Analyze image. Return JSON with keys: primaryIssue, overallHealth, urgency, generalRecommendations. Language: ${language}.`;
              const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${optimized.toString('base64')}` } }] }],
                model: "meta-llama/llama-4-scout-17b-16e-instruct", response_format: { type: "json_object" }
              });
              analysisResult = JSON.parse(completion.choices[0].message.content);
            }

            if (mongoose.connection.readyState === 1) {
              const userId = req.headers['x-user-id'] || 'anonymous';
              FertilizerHistory.create({ userId, primaryIssue: analysisResult.primaryIssue, overallHealth: analysisResult.overallHealth, urgency: analysisResult.urgency }).catch(() => {});
            }
            resolve(res.json({ success: true, data: analysisResult }));
          } catch (e) {
            resolve(res.status(500).json({ success: false, message: e.message }));
          }
        });

        req.pipe(busboy);
      });
    }

    res.status(404).json({ success: false, message: 'Not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
