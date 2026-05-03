const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const paymentRoutes = require('./routes/payment');

// Load environment variables
dotenv.config({ path: '../../.env.runtime' });
dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.PORT || 5010;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/payment', paymentRoutes);


// Health Check
app.get('/health', (req, res) => res.json({ status: 'Payment Service is healthy' }));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan-payment';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Payment Service: Connected to MongoDB'))
  .catch(err => console.error('❌ Payment Service: MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`🚀 Payment Service running on port ${PORT}`);
});
