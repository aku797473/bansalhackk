const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  produceName: { type: String, required: true },
  category: { type: String, required: true }, // e.g., Vegetables, Grains, Fruits
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // kg, quintal, ton
  price: { type: Number, required: true }, // Price per unit
  description: { type: String },
  location: {
    district: String,
    state: String,
    village: String
  },
  images: [String],
  status: { type: String, enum: ['available', 'sold_out', 'archived'], default: 'available' },
  farmerIsPremium: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);
