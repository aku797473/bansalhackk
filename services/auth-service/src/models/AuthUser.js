const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  name:  { type: String, default: '' },
  role:  { 
    type: String, 
    enum: ['farmer', 'buyer', 'labour', 'admin'], 
    default: 'farmer' 
  },
  isActive:      { type: Boolean, default: true },
  lastLoginAt:   { type: Date },
  refreshTokens: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('AuthUser', userSchema);
