const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../../../.env' });

const app = express();
const PORT = process.env.PORT || 5010;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. DATABASE
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan';
mongoose.connect(MONGODB_URI).then(() => console.log('Connected to Mongo'));

const Buyer = require('./models/Buyer');

// 2. ABSOLUTE ROUTES (NO PREFIXES)
app.get('/api/buyer/test', (req, res) => res.json({ msg: 'V4 WORKING' }));
app.get('/api/buyer/list', async (req, res) => {
  const data = await Buyer.find();
  res.json({ success: true, data });
});
app.post('/api/buyer/register', async (req, res) => {
  const b = new Buyer(req.body);
  await b.save();
  res.json({ success: true, data: b });
});
app.get('/api/buyer/map-markers', async (req, res) => {
  const buyers = await Buyer.find({ 'location.lat': { $exists: true } });
  res.json({ success: true, data: buyers.map(b => ({ lat: b.location.lat, lng: b.location.lng, title: b.shopName })) });
});

// 3. LEGACY ROUTES
const paymentRoutes = require('./routes/payment');
const labourRoutes = require('./routes/labour');
const buyerRoutes = require('./routes/buyer');

app.use('/payment', paymentRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/buyer', buyerRoutes);

// 4. CATCH ALL
app.use((req, res) => {
  res.status(404).json({ error: '404', path: req.url, info: 'V4 IS RUNNING' });
});

app.listen(PORT, () => console.log(`V4 HUB ON ${PORT}`));
