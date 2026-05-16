const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone:    { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  name:     { type: String, default: '' },
  email:    { type: String, index: { unique: false, sparse: true } }, // Explicitly non-unique and sparse
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
