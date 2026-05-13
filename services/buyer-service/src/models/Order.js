const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyerId: { type: String, required: true },
  buyerName: { type: String },
  farmerId: { type: String, required: true },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  deliveryStatus: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
