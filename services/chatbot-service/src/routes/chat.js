const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const ChatHistory = require('../models/ChatHistory');

// Initialize AI Clients
const openai = (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_'))
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const genAI = (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_'))
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const groq = (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_'))
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const SYSTEM_PROMPT = `You are Kisan Mitra (किसान मित्र), a helpful agricultural assistant for Indian farmers. Respond in the same language the user uses (Hindi/English). Keep it simple and practical.`;

const getMockResponse = (message, language) => {
  return "नमस्ते! मैं आपकी खेती में मदद कर सकता हूँ। अभी AI सर्वर लोड ले रहा है, कृपया थोड़ी देर में प्रयास करें। (Namaste! I can help with farming. AI server is busy, please try in a bit.)";
};

// GET /chatbot/history/:sessionId
router.get('/history/:sessionId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const chat = await ChatHistory.findOne({ sessionId: req.params.sessionId, userId });
    
    if (!chat) {
      return res.json({ success: true, data: [] });
    }
    
    res.json({ success: true, data: chat.messages });
  } catch (err) {
    console.error('❌ CHATBOT HISTORY ERROR:', err);
    res.status(500).json({ success: false, message: 'History Fetch Error', error: err.message });
  }
});

// DELETE /chatbot/history/:sessionId
router.delete('/history/:sessionId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    await ChatHistory.deleteOne({ sessionId: req.params.sessionId, userId });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /chatbot/history
router.get('/history', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const chats = await ChatHistory.find({ userId }).sort({ updatedAt: -1 }).limit(20);
    res.json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /chatbot/message
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, language = 'hi' } = req.body;
    const userId = req.headers['x-user-id'] || 'anonymous';
    const sid = sessionId || uuidv4();
    
    let chatRecord = await ChatHistory.findOne({ sessionId: sid, userId });
    if (!chatRecord) {
      chatRecord = new ChatHistory({ userId, sessionId: sid, language, messages: [] });
    }
    
    const history = chatRecord.messages.map(m => ({ role: m.role, content: m.content }));

    let reply;

    // 1. TRY GROQ (Updated Model)
    if (groq) {
      try {
        console.log('Attempting Groq (llama-3.3-70b-versatile)...');
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
            { role: "user", content: message }
          ],
          model: "llama-3.3-70b-versatile",
        });
        reply = chatCompletion.choices[0].message.content;
        console.log('Groq Success!');
      } catch (e) {
        console.error('Groq Error:', e.message);
      }
    }

    // 2. TRY GEMINI (Updated Model Name)
    if (!reply && genAI) {
      try {
        console.log('Attempting Gemini AI (gemini-1.5-flash-latest)...');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(SYSTEM_PROMPT + "\n\nUser: " + message);
        reply = result.response.text();
        console.log('Gemini Success!');
      } catch (e) {
        console.error('Gemini Error:', e.message);
      }
    }

    // 3. TRY OPENAI (Fallback)
    if (!reply && openai) {
      try {
        console.log('Attempting OpenAI...');
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
            { role: "user", content: message }
          ]
        });
        reply = completion.choices[0].message.content;
        console.log('OpenAI Success!');
      } catch (e) {
        console.error('OpenAI Error:', e.message);
      }
    }

    // 4. MOCK FALLBACK
    if (!reply) {
      reply = getMockResponse(message, language);
    }

    // Save history
    chatRecord.messages.push({ role: 'user', content: message });
    chatRecord.messages.push({ role: 'assistant', content: reply });
    
    // Optional: limit history size if it gets too large
    if (chatRecord.messages.length > 40) {
       chatRecord.messages = chatRecord.messages.slice(-40);
    }

    await chatRecord.save();
    console.log(`✅ Chatbot: Response saved for session ${sid}`);

    res.json({ success: true, data: { reply, sessionId: sid } });
  } catch (err) {
    console.error('❌ CHATBOT CRITICAL ERROR:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Chatbot Service Error', 
      error: err.message,
      details: err.stack?.split('\n')[1] // Send first line of stack for easier debugging
    });
  }
});

const fs = require('fs');
const path = require('path');
const os = require('os');

// POST /chatbot/voice/transcribe
router.post('/voice/transcribe', async (req, res) => {
  try {
    const { audioBase64, language = 'hi' } = req.body;
    if (!audioBase64) return res.status(400).json({ success: false, message: 'Audio data missing' });

    // Decode base64 and save to temp file
    const buffer = Buffer.from(audioBase64, 'base64');
    const tmpFile = path.join(os.tmpdir(), `audio_${Date.now()}.webm`);
    fs.writeFileSync(tmpFile, buffer);

    let transcript = '';
    
    // Use Groq Whisper for High Quality STT
    if (groq) {
      try {
         const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(tmpFile),
            model: "whisper-large-v3-turbo",
            response_format: "json",
            language: language === 'hi' ? 'hi' : 'en',
         });
         transcript = transcription.text;
      } catch (e) {
         console.error('Groq Whisper Error:', e.message);
      }
    }
    
    // Fallback to OpenAI Whisper if Groq fails
    if (!transcript && openai) {
       try {
         const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tmpFile),
            model: "whisper-1",
            language: language === 'hi' ? 'hi' : 'en',
         });
         transcript = transcription.text;
       } catch (e) {
         console.error('OpenAI Whisper Error:', e.message);
       }
    }

    // Cleanup temp file
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

    if (!transcript) {
       return res.status(500).json({ success: false, message: 'Transcription failed via all AI providers' });
    }

    // --- LLM Intent Routing ---
    let routing = { route: null, responseEn: 'Could not understand', responseHi: 'समझ नहीं आया' };
    
    if (groq && transcript.trim().length > 0) {
      try {
        const classificationPrompt = `You are the voice command router for a smart farming app called Smart Kisan.
Analyze the user's spoken voice query (which may be in Hindi, Roman Hindi, or English) and classify it into EXACTLY ONE of the following routes:
- "/weather" : for weather, rain, climate, temperature (Hindi: मौसम, बारिश, तापमान)
- "/market" : for mandi rates, crop prices, selling bhav, market (Hindi: मंडी भाव, फसल का दाम, रेट)
- "/crop" : for crop advisory, farming advice, what to grow, sowing, harvesting (Hindi: फसल सलाह, खेती, क्या उगाएं)
- "/fertilizer" : for fertilizers, urea, khad, pesticides, soil health, crop medicine (Hindi: खाद, यूरिया, कीटनाशक, मिट्टी जांच)
- "/labour" : for hiring workers, helpers, mazdoor (Hindi: मजदूर, कामगार, मजदूर ढूंढो)
- "/news" : for agricultural news, updates (Hindi: समाचार, खेती की खबर, न्यूज़)
- "/map" : for field map, land mapping (Hindi: खेत का नक्शा, जमीन नापना, मैप)
- "/schemes" : for government schemes, subsidy, PM Kisan yojana (Hindi: सरकारी योजना, सब्सिडी, योजनाएं)
- "/profile" : for user profile, account settings (Hindi: प्रोफाइल, खाता, सेटिंग्स)
- "/" : for home, dashboard, going back, exit (Hindi: होम, डैशबोर्ड, वापस)

Response format: Return ONLY a valid JSON object:
{
  "route": "/route-name",
  "confidence": 0.0 to 1.0,
  "responseEn": "Brief response in English about what you are opening",
  "responseHi": "Brief response in Hindi about what you are opening"
}
If no route fits well (confidence < 0.4), return route: null.

User spoken query: "${transcript}"
JSON:`;

        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: classificationPrompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          temperature: 0.1,
        });

        const resultJson = JSON.parse(completion.choices[0].message.content);
        if (resultJson && resultJson.confidence >= 0.4) {
          routing = resultJson;
        }
      } catch (err) {
        console.error('LLM Routing Error:', err.message);
      }
    }

    res.json({ 
      success: true, 
      text: transcript,
      routing
    });
  } catch (err) {
    console.error('Transcription Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
