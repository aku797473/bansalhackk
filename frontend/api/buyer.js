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
  ownerIsPremium: { type: Boolean, default: false },
}, { timestamps: true });

// --- Listing Schema (Farmer's Produce) ---
const ListingSchema = new mongoose.Schema({
  farmerId: { type: String, default: 'anonymous' },
  farmerName: { type: String, required: true },
  produceName: { type: String, required: true },
  category: { type: String, enum: ['grains', 'vegetables', 'fruits', 'pulses', 'oilseeds', 'spices', 'other'], default: 'other' },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['kg', 'quintal', 'ton', 'bag'], default: 'quintal' },
  price: { type: Number, required: true },
  description: { type: String },
  images: [{ type: String }],
  location: {
    village: { type: String },
    district: { type: String },
    state: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  status: { type: String, enum: ['available', 'sold_out', 'expired'], default: 'available' },
  farmerIsPremium: { type: Boolean, default: false },
}, { timestamps: true });

// --- Order Schema ---
const OrderSchema = new mongoose.Schema({
  buyerId: { type: String, required: true },
  listingId: { type: String },
  shopId: { type: String },
  farmerId: { type: String },
  quantity: { type: Number },
  items: [{ type: Object }],
  totalAmount: { type: Number, required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
}, { timestamps: true });

const Buyer = mongoose.models.Buyer || mongoose.model('Buyer', BuyerSchema);
const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectToDatabase();

    const segments = req.url.split('?')[0].split('/').filter(Boolean);
    const endpoint = segments[segments.length - 1];
    const secondLast = segments[segments.length - 2];

    // ─── BUYER/SHOP ROUTES ─────────────────────────────────────────────

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

    // ─── LISTINGS ROUTES ───────────────────────────────────────────────

    // GET /api/buyer/listings
    if (req.method === 'GET' && endpoint === 'listings') {
      const { category, state, district } = req.query;
      const filter = { status: 'available' };
      if (category && category !== 'all') filter.category = category;
      if (state) filter['location.state'] = new RegExp(state, 'i');
      if (district) filter['location.district'] = new RegExp(district, 'i');
      const listings = await Listing.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, data: listings });
    }

    // POST /api/buyer/listings
    if (req.method === 'POST' && endpoint === 'listings') {
      const userId = req.headers['x-user-id'] || 'anonymous';
      const listing = new Listing({ ...req.body, farmerId: userId });
      await listing.save();
      return res.status(201).json({ success: true, data: listing });
    }

    // ─── ORDERS ROUTES ─────────────────────────────────────────────────

    // POST /api/buyer/orders
    if (req.method === 'POST' && endpoint === 'orders') {
      const buyerId = req.headers['x-user-id'] || 'anonymous';
      const { listingId, shopId, items, quantity, totalAmount, razorpayOrderId } = req.body;

      let orderData = {
        buyerId,
        totalAmount,
        razorpayOrderId,
        paymentStatus: 'pending'
      };

      if (listingId) {
        const listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
        orderData.listingId = listingId;
        orderData.farmerId = listing.farmerId;
        orderData.quantity = quantity;
      } else if (shopId) {
        orderData.shopId = shopId;
        orderData.items = items;
      }

      const order = new Order(orderData);
      await order.save();
      return res.status(201).json({ success: true, data: order });
    }

    // PATCH /api/buyer/orders/:id/payment
    if (req.method === 'PATCH' && endpoint === 'payment' && secondLast) {
      const orderId = secondLast;
      const { paymentStatus, razorpayPaymentId } = req.body;
      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus, razorpayPaymentId },
        { new: true }
      );
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      if (paymentStatus === 'paid' && order.listingId) {
        const listing = await Listing.findById(order.listingId);
        if (listing) {
          listing.quantity -= (order.quantity || 0);
          if (listing.quantity <= 0) listing.status = 'sold_out';
          await listing.save();
        }
      }
      return res.json({ success: true, data: order });
    }

    // GET /api/buyer/:id (Shop by ID — Wildcard MUST be last)
    if (req.method === 'GET' && endpoint.match(/^[0-9a-fA-F]{24}$/)) {
      const buyer = await Buyer.findById(endpoint);
      if (!buyer) return res.status(404).json({ success: false, message: 'Shop not found' });
      return res.json({ success: true, data: buyer });
    }

    res.status(404).json({ success: false, message: 'Endpoint not found', url: req.url });
  } catch (error) {
    console.error('Buyer API Error:', error);
    let msg = error.message || 'Internal server error';
    if (msg.includes('mongodb') || msg.includes('Cluster') || msg.includes('@') || msg.includes('URI')) {
      msg = 'Database connection error. Please check configuration.';
    }
    res.status(500).json({ success: false, message: msg });
  }
};
