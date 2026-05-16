const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Buyer = require('../models/Buyer'); // New model migrated from Gateway

// ─── Shop/Business Management (from Gateway) ──────────────────────────

// Get all shops/buyers
router.get('/list', async (req, res) => {
  try {
    const { category, state, district } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (state) filter['location.state'] = new RegExp(state, 'i');
    if (district) filter['location.district'] = new RegExp(district, 'i');

    const buyers = await Buyer.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: buyers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Register as a Shop/Business
router.post('/register', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const buyer = new Buyer({ ...req.body, userId });
    await buyer.save();
    res.status(201).json({ success: true, data: buyer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get shop details
router.get('/:id', async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) return res.status(404).json({ success: false, message: 'Shop not found' });
    res.json({ success: true, data: buyer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Map Markers for Shops
router.get('/map-markers', async (req, res) => {
  try {
    const buyers = await Buyer.find({ 'location.lat': { $exists: true } });
    const markers = buyers.map(b => ({
      lat: b.location.lat,
      lng: b.location.lng,
      type: 'buyer',
      title: b.shopName,
      info: `${b.category} · ${b.location.district}`,
      detail: `Owner: ${b.ownerName} · Phone: ${b.phone}`
    }));
    res.json({ success: true, data: markers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Direct Farmer Marketplace (Existing Buyer Service) ───────────────

// Get all listings
router.get('/listings', async (req, res) => {
  try {
    const { category, state, district } = req.query;
    const filter = { status: 'available' };
    if (category) filter.category = category;
    if (state) filter['location.state'] = state;
    if (district) filter['location.district'] = district;

    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a listing
router.post('/listings', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const listing = new Listing({ ...req.body, farmerId: userId });
    await listing.save();
    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Unified Order Management ─────────────────────────────────────────

// Create an order (Direct Listing OR Shop Purchase)
router.post('/orders', async (req, res) => {
  try {
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
      orderData.items = items; // For shop inventory purchases
    }

    const order = new Order(orderData);
    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update order payment status
router.patch('/orders/:id/payment', async (req, res) => {
  try {
    const { paymentStatus, razorpayPaymentId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, razorpayPaymentId },
      { new: true }
    );
    
    if (paymentStatus === 'paid' && order.listingId) {
      const listing = await Listing.findById(order.listingId);
      if (listing) {
        listing.quantity -= (order.quantity || 0);
        if (listing.quantity <= 0) {
          listing.status = 'sold_out';
        }
        await listing.save();
      }
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
