const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone:    { type: String, unique: true, sparse: true, index: true }, // Optional, but unique if present
  password: { type: String }, // Optional for OAuth users
  name:     { type: String, default: '' },
  email:    { type: String, index: { unique: false, sparse: true } }, // Explicitly non-unique and sparse
  googleId: { type: String, unique: true, sparse: true, index: true }, // Unique ID for Google Login
  role:  { 
    type: String, 
    enum: ['farmer', 'seller', 'labor', 'buyer', 'labour', 'admin'], 
    default: 'farmer' 
  },
  isActive:      { type: Boolean, default: true },
  lastLoginAt:   { type: Date },
  refreshTokens: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('AuthUser', userSchema);
