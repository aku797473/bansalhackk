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
      return res.status(404).json({ success: false, message: 'Chat history not found' });
    }
    
    res.json({ success: true, data: chat.messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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

    res.json({ success: true, data: { reply, sessionId: sid } });
  } catch (err) {
    console.error('Chatbot Error Details:', err);
    res.status(500).json({ success: false, message: err.message || 'Error' });
  }
});

module.exports = router;
