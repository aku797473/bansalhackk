const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Direct Marketplace Fields
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  farmerId: { type: String },
  quantity: { type: Number },
  
  // Shop Purchase Fields (from Gateway)
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' },
  items: [{
    itemName: String,
    price: Number,
    quantity: Number,
    unit: String
  }],

  // Common Fields
  buyerId: { type: String, required: true },
  buyerName: { type: String },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  deliveryStatus: { type: String, enum: ['pending', 'shipped', 'delivered', 'not_applicable'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
