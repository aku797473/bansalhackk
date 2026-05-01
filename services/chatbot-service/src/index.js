require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5008;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));

app.use('/chatbot', chatRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'chatbot-service', mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

async function connectMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('✅ MongoDB connected:', uri.replace(/\/\/.*@/, '//***@'));
  } catch (err) {
    console.warn('⚠️  Cannot connect to MongoDB:', err.message);
  }
}

connectMongo().then(() => {
  app.listen(PORT, () => console.log(`🤖 Chatbot Service on port ${PORT}`));
});
