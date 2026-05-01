require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const marketRoutes = require('./routes/market');

const app = express();
const PORT = process.env.PORT || 5006;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/market', marketRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'market-service', mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

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
  app.listen(PORT, () => console.log(`💰 Market Service on port ${PORT}`));
});
