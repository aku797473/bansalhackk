const mongoose = require('mongoose');

// --- MongoDB Configuration ---
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  cachedDb = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return cachedDb;
}

// --- Buyer/Shop Schema ---
const BuyerSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  category: { type: String, enum: ['trader', 'seeds', 'fertilizer', 'machinery', 'other'], default: 'trader' },
  address: { type: String },
  description: { type: String },
  image: { type: String },
  location: {
    village: { type: String },
    district: { type: String },
    state: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  inventory: [{
    itemName: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, enum: ['kg', 'quintal', 'bag', 'piece', 'litre'], default: 'kg' },
    description: { type: String },
    available: { type: Boolean, default: true },
  }],
  rating: { type: Number, default: 4.5 },
  userId: { type: String },
}, { timestamps: true });

const Buyer = mongoose.models.Buyer || mongoose.model('Buyer', BuyerSchema);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectToDatabase();

    const segments = req.url.split('?')[0].split('/').filter(Boolean);
    // URL: /api/buyer/list OR /api/buyer/register OR /api/buyer/map-markers OR /api/buyer/:id
    const endpoint = segments[segments.length - 1];

    // GET /api/buyer/list
    if (req.method === 'GET' && endpoint === 'list') {
      const { category, state, district } = req.query;
      const filter = {};
      if (category && category !== 'all') filter.category = category;
      if (state) filter['location.state'] = new RegExp(state, 'i');
      if (district) filter['location.district'] = new RegExp(district, 'i');
      const buyers = await Buyer.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, data: buyers });
    }

    // POST /api/buyer/register
    if (req.method === 'POST' && endpoint === 'register') {
      const userId = req.headers['x-user-id'] || 'anonymous';
      const buyer = new Buyer({ ...req.body, userId });
      await buyer.save();
      return res.status(201).json({ success: true, data: buyer });
    }

    // GET /api/buyer/map-markers
    if (req.method === 'GET' && endpoint === 'map-markers') {
      const buyers = await Buyer.find({ 'location.lat': { $exists: true } }).limit(100);
      const markers = buyers.map(b => ({
        lat: b.location.lat,
        lng: b.location.lng,
        type: 'buyer',
        title: b.shopName,
        info: `${b.category} · ${b.location?.district || ''}`,
        detail: `Owner: ${b.ownerName} · Phone: ${b.phone}`
      }));
      return res.json({ success: true, data: markers });
    }

    // GET /api/buyer/test
    if (req.method === 'GET' && endpoint === 'test') {
      return res.json({ success: true, message: 'Buyer Vercel Function is LIVE! ✅' });
    }

    // GET /api/buyer/:id
    if (req.method === 'GET' && endpoint.match(/^[0-9a-fA-F]{24}$/)) {
      const buyer = await Buyer.findById(endpoint);
      if (!buyer) return res.status(404).json({ success: false, message: 'Shop not found' });
      return res.json({ success: true, data: buyer });
    }

    res.status(404).json({ success: false, message: 'Endpoint not found', url: req.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
