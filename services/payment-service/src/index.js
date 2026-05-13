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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Root route to verify deployment
app.get('/', (req, res) => res.json({ 
  service: 'Smart Kisan Business Hub', 
  version: '2.1', 
  status: 'operational',
  endpoints: ['/api/buyer/test', '/api/buyer/list', '/api/buyer/register']
}));

// Test route at root for easy debugging
app.get('/api/buyer/test', (req, res) => res.json({ success: true, message: 'Buyer Hub v2 is LIVE and READY!' }));
app.get('/api/buyer/list', async (req, res) => {
  try {
    const Buyer = require('./models/Buyer');
    const buyers = await Buyer.find();
    res.json({ success: true, data: buyers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/buyer/register', async (req, res) => {
  try {
    const Buyer = require('./models/Buyer');
    const buyer = new Buyer(req.body);
    await buyer.save();
    res.status(201).json({ success: true, data: buyer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const labourRoutes = require('./routes/labour');
const buyerRoutes = require('./routes/buyer');

// Routes
app.use('/payment', paymentRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/buyer', buyerRoutes);
app.use('/labour', labourRoutes);

app.get('/test-payment-direct', (req, res) => res.send('Payment Service Direct Test Working!'));
app.get('/api/labour/test', (req, res) => res.send('Labour via Payment Service working!'));


// Health Check
app.get('/health', (req, res) => res.json({ status: 'Payment Service is healthy' }));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan-payment';
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✅ Payment Service: Connected to MongoDB'))
  .catch(err => console.error('❌ Payment Service: MongoDB connection error:', err));

// Final Catch-all for debugging
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    url: req.url, 
    method: req.method,
    available_routes: ['/api/buyer/test', '/api/buyer/register', '/api/buyer/list']
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Payment Service running on port ${PORT}`);
});
