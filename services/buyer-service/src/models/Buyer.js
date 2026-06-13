const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  category: { type: String, enum: ['trader', 'seeds', 'fertilizer', 'machinery', 'other'], default: 'trader' },
  address: { type: String, required: true },
  location: {
    district: { type: String, required: true },
    state: { type: String, required: true },
    village: { type: String },
    lat: { type: Number },
    lng: { type: Number }
  },
  inventory: [{
    itemName: String,
    price: Number,
    unit: String, // kg, quintal, piece
    description: String,
    image: String
  }],
  description: { type: String },
  image: { type: String },
  rating: { type: Number, default: 4.5 },
  isVerified: { type: Boolean, default: false },
  ownerIsPremium: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Buyer', buyerSchema);
