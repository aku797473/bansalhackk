const express = require('express');
const router = express.Router();
const Buyer = require('../models/Buyer');
const Order = require('../models/Order');

// Test route
router.get('/test', (req, res) => res.json({ success: true, message: 'Buyer Hub is live!' }));

// Get all buyers/shops
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

// Register as a Buyer/Shop
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

// Get buyer details
router.get('/:id', async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found' });
    res.json({ success: true, data: buyer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Map Markers for Buyers
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

// Create an order/purchase from a shop
router.post('/orders', async (req, res) => {
  try {
    const buyerId = req.headers['x-user-id'] || 'anonymous';
    const { shopId, items, totalAmount, razorpayOrderId } = req.body;
    
    // items is array of { itemName, quantity, price }
    const order = new Order({
      buyerId,
      shopId,
      items,
      totalAmount,
      razorpayOrderId,
      paymentStatus: 'pending'
    });

    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
