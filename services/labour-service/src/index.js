require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const labourRoutes = require('./routes/labour');

const app = express();
const PORT = process.env.PORT || 5007;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/labour', labourRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'labour-service' }));

// ─── Robust MongoDB connect ───────────────────────────
const connectMongo = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan';
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(uri, options);
    console.log('✅ Labour Service: MongoDB connected');
  } catch (err) {
    console.error('❌ Labour Service: MongoDB connection failed:', err.message);
    console.log('⚠️  Starting server anyway for resilience...');
  }
};

// Start both
connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`👷 Labour Service running on port ${PORT}`);
  });
});
