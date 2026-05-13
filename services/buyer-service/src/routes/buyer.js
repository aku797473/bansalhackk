const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const Order = require('../models/Order');

// Get all listings (Marketplace)
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

// Create a listing (Farmer side)
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

// Get listing details
router.get('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create an order (Buyer side)
router.post('/orders', async (req, res) => {
  try {
    const buyerId = req.headers['x-user-id'] || 'anonymous';
    const { listingId, quantity, totalAmount, razorpayOrderId } = req.body;
    
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    const order = new Order({
      listingId,
      buyerId,
      farmerId: listing.farmerId,
      quantity,
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

// Update order payment status
router.patch('/orders/:id/payment', async (req, res) => {
  try {
    const { paymentStatus, razorpayPaymentId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, razorpayPaymentId },
      { new: true }
    );
    
    if (paymentStatus === 'paid') {
      // Logic to reduce listing quantity or mark as sold out
      const listing = await Listing.findById(order.listingId);
      if (listing) {
        listing.quantity -= order.quantity;
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
