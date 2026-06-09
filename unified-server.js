/**
 * unified-server.js
 * Runs ALL microservices in a SINGLE process.
 */
require('dotenv').config({ path: '.env.runtime' });
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role', 'x-user-email'],
  credentials: true,
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan('dev'));

// FORCE JSON PARSING
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// AUTH DEBUG LOGGER
app.use((req, res, next) => {
  if (req.path.includes('/auth/')) {
    console.log(`[UNIFIED-AUTH-DEBUG] ${req.method} ${req.path} | Body: ${JSON.stringify(req.body)}`);
  }
  next();
});

// ─── Auth middleware ──────────────────────────────
const { verifyToken } = require('./gateway/src/middleware/auth');

// ─── Route Files ─────────────────────────────────
const safeRequire = (path, name) => {
  try { return require(path); }
  catch (e) {
    console.error(`❌ FAILED TO LOAD ${name}:`, e.message);
    return null;
  }
};

// PRE-LOAD ALL MODELS
safeRequire('./services/auth-service/src/models/AuthUser', 'Model:AuthUser');
safeRequire('./services/user-service/src/models/UserProfile', 'Model:UserProfile');
safeRequire('./services/user-service/src/models/Feedback', 'Model:Feedback');
safeRequire('./services/labour-service/src/models/Job', 'Model:Job');
safeRequire('./services/chatbot-service/src/models/ChatHistory', 'Model:ChatHistory');
safeRequire('./services/weather-service/src/models/WeatherHistory', 'Model:WeatherHistory');
safeRequire('./services/market-service/src/models/MarketHistory', 'Model:MarketHistory');
safeRequire('./services/buyer-service/src/models/Buyer', 'Model:Buyer');
safeRequire('./services/buyer-service/src/models/Listing', 'Model:Listing');
safeRequire('./services/buyer-service/src/models/Order', 'Model:Order');

const authRoutes = safeRequire('./services/auth-service/src/routes/auth', 'auth');
const userRoutes = safeRequire('./services/user-service/src/routes/user', 'user');
const weatherRoutes = safeRequire('./services/weather-service/src/routes/weather', 'weather');
const cropRoutes = safeRequire('./services/crop-service/src/routes/crop', 'crop');
const fertilizerRoutes = safeRequire('./services/fertilizer-service/src/routes/fertilizer', 'fertilizer');
const marketRoutes = safeRequire('./services/market-service/src/routes/market', 'market');
const labourRoutes = safeRequire('./services/labour-service/src/routes/labour', 'labour');
const chatRoutes = safeRequire('./services/chatbot-service/src/routes/chat', 'chatbot');
const paymentRoutes = safeRequire('./services/payment-service/src/routes/payment', 'payment');
const schemesRoutes = safeRequire('./services/schemes-service/src/routes/schemes', 'schemes');
const newsRoutes = safeRequire('./services/news-service/src/routes/news', 'news');
const buyerRoutes = safeRequire('./services/buyer-service/src/routes/buyer', 'buyer');
const communityRoutes = safeRequire('./services/community-service/src/routes/community', 'community');

// ─── Public Routes ───────────────────────────────
if (authRoutes) app.use('/api/auth', authRoutes);

app.get('/api/wake', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'unified',
    dbState: mongoose.connection.readyState,
    hasMongo: !!process.env.MONGODB_URI
  });
});

// ─── Microservice Routes ────────────────────────────
if (userRoutes) app.use('/api/users', verifyToken, userRoutes);
if (weatherRoutes) app.use('/api/weather', verifyToken, weatherRoutes);
if (cropRoutes) app.use('/api/crop', verifyToken, cropRoutes);
if (fertilizerRoutes) app.use('/api/fertilizer', verifyToken, fertilizerRoutes);
if (marketRoutes) app.use('/api/market', (req, res, next) => (req.method === 'GET' ? next() : verifyToken(req, res, next)), marketRoutes);
if (labourRoutes) app.use('/api/labour', (req, res, next) => (req.method === 'GET' ? next() : verifyToken(req, res, next)), labourRoutes);
if (chatRoutes) app.use('/api/chatbot', verifyToken, chatRoutes);
if (paymentRoutes) app.use('/api/payment', verifyToken, paymentRoutes);
if (schemesRoutes) app.use('/api/schemes', verifyToken, schemesRoutes);
if (newsRoutes) app.use('/api/news', verifyToken, newsRoutes);
if (buyerRoutes) app.use('/api/buyer', (req, res, next) => (req.method === 'GET' ? next() : verifyToken(req, res, next)), buyerRoutes);
if (communityRoutes) app.use('/api/community', verifyToken, communityRoutes);
// Serve frontend static assets
const frontendDist = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendDist));

// SPA fallback for react router
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDist, 'index.html'));
  } else {
    res.status(404).json({ success: false, message: 'Route not found' });
  }
});

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');

    // Drop legacy unique email index in production database if it exists
    try {
      const AuthUser = mongoose.models.AuthUser || mongoose.model('AuthUser');
      if (AuthUser) {
        await AuthUser.collection.dropIndex('email_1');
        console.log('🗑️  Dropped legacy unique email index in production database');
      }
    } catch (e) {
      // Ignore error if index doesn't exist
    }

    try {
      const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile');
      if (UserProfile) {
        await UserProfile.collection.dropIndex('email_1').catch(() => { });
        await UserProfile.collection.dropIndex('phone_1').catch(() => { });
        console.log('🗑️  Dropped legacy unique email/phone indices in UserProfile collection');
      }
    } catch (e) {
      // Ignore
    }
  }
  catch (err) { console.error('❌ MongoDB Error:', err.message); }
}

connectMongo().then(() => {
  server.listen(PORT, () => console.log(`🚀 Unified Smart Kisan Server on port ${PORT}`));
  
  // ─── Socket.io Community Logic ───────────────────────
  const io = new Server(server, {
    cors: {
      origin: (origin, cb) => cb(null, true),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const CommunityMessage = mongoose.models.CommunityMessage || require('./services/community-service/src/models/CommunityMessage');

  // AI client engines (reusing chatbot service API keys and configuration)
  const Groq = require('groq-sdk');
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const { OpenAI } = require('openai');

  const commGroq = (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_'))
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

  const commGenAI = (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_'))
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

  const commOpenai = (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_'))
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  const BOT_SYSTEM_PROMPT = `You are Kisan Mitra (किसान मित्र), a helpful agricultural assistant for Indian farmers. You are answering a question in a public community chat room. Keep your answer brief, clear, practical, and in the same language as the user query (Hindi or English). Do not write more than 3-4 sentences.`;

  // Track active users: roomName -> Array of users
  const activeUsers = {};

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected to Socket.io: ${socket.id}`);

    socket.on('join-room', ({ room, user }) => {
      if (!room || !user) return;
      socket.join(room);
      socket.room = room;
      socket.userData = user;
      
      console.log(`👤 User ${user.name} (${user.role}) joined room: ${room}`);

      if (!activeUsers[room]) {
        activeUsers[room] = [];
      }
      
      // Avoid adding duplicate users from the same connection / tab
      if (!activeUsers[room].some(u => u.id === user.id)) {
        activeUsers[room].push({
          id: user.id,
          socketId: socket.id,
          name: user.name,
          role: user.role,
          image: user.image || user.profilePic || null
        });
      }

      // Broadcast active user list to the room
      io.to(room).emit('active-users', activeUsers[room]);
    });

    socket.on('send-message', async (data) => {
      try {
        const { room, senderId, senderName, senderRole, senderImage, message } = data;
        if (!room || !message) return;

        // Save message to MongoDB
        const newMessage = new CommunityMessage({
          senderId,
          senderName,
          senderRole,
          senderImage,
          message,
          room
        });
        await newMessage.save();

        // Broadcast message to everyone in the room
        io.to(room).emit('receive-message', newMessage);

        // Check if message mentions Kisan Mitra AI
        const lowerMsg = message.toLowerCase();
        const mentionsAI = lowerMsg.includes('@kisan') || lowerMsg.includes('@mitra') || lowerMsg.includes('@ai');
        
        if (mentionsAI) {
          const cleanMsg = message.replace(/@kisan|@mitra|@ai/gi, '').trim();
          if (cleanMsg.length > 0) {
            let reply = null;

            // 1. Try Groq
            if (commGroq) {
              try {
                console.log('Community Bot attempting Groq (llama-3.3-70b-versatile)...');
                const completion = await commGroq.chat.completions.create({
                  messages: [
                    { role: "system", content: BOT_SYSTEM_PROMPT },
                    { role: "user", content: cleanMsg }
                  ],
                  model: "llama-3.3-70b-versatile",
                });
                reply = completion.choices[0].message.content;
              } catch (e) {
                console.error('Community Bot Groq Error:', e.message);
              }
            }

            // 2. Try Gemini
            if (!reply && commGenAI) {
              try {
                console.log('Community Bot attempting Gemini...');
                const model = commGenAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
                const result = await model.generateContent(BOT_SYSTEM_PROMPT + "\n\nUser: " + cleanMsg);
                reply = result.response.text();
              } catch (e) {
                console.error('Community Bot Gemini Error:', e.message);
              }
            }

            // 3. Try OpenAI
            if (!reply && commOpenai) {
              try {
                console.log('Community Bot attempting OpenAI...');
                const completion = await commOpenai.chat.completions.create({
                  model: "gpt-4o-mini",
                  messages: [
                    { role: "system", content: BOT_SYSTEM_PROMPT },
                    { role: "user", content: cleanMsg }
                  ]
                });
                reply = completion.choices[0].message.content;
              } catch (e) {
                console.error('Community Bot OpenAI Error:', e.message);
              }
            }

            // Fallback mock
            if (!reply) {
              reply = "नमस्ते! मैं अभी जवाब देने में असमर्थ हूँ। कृपया बाद में प्रयास करें। (AI Server currently busy, please try later.)";
            }

            const aiMessage = new CommunityMessage({
              senderId: 'ai-bot',
              senderName: 'Kisan Mitra (AI Assistant)',
              senderRole: 'AI Bot',
              senderImage: 'ai', // flag to show AI bot icon
              message: reply,
              room
            });
            await aiMessage.save();

            // Broadcast AI reply
            io.to(room).emit('receive-message', aiMessage);
          }
        }
      } catch (err) {
        console.error('❌ Socket message handling error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      const room = socket.room;
      const user = socket.userData;
      console.log(`🔌 Client disconnected from Socket.io: ${socket.id}`);

      if (room && activeUsers[room]) {
        activeUsers[room] = activeUsers[room].filter(u => u.socketId !== socket.id);
        io.to(room).emit('active-users', activeUsers[room]);
      }
    });
  });
});
