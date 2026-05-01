const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId:   { type: String, required: true, unique: true, index: true },
  phone:    { type: String },
  name:     { type: String, default: '' },
  email:    { type: String, default: '' },
  role:     { type: String, enum: ['farmer', 'buyer', 'labour', 'admin'], default: 'farmer' },
  language: { type: String, enum: ['en', 'hi', 'pa', 'ta', 'te'], default: 'hi' },
  location: {
    lat:      { type: Number },
    lng:      { type: Number },
    village:  { type: String, default: '' },
    district: { type: String, default: '' },
    state:    { type: String, default: '' },
    pincode:  { type: String, default: '' },
  },
  farmDetails: {
    landArea:   { type: Number },    // in acres
    soilType:   { type: String, enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other'] },
    irrigation: { type: String, enum: ['rain-fed', 'canal', 'borewell', 'drip', 'other'] },
  },
  profilePic: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userSchema);
