const mongoose = require('mongoose');

const MarketHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  state: { type: String },
  district: { type: String },
  commodity: { type: String },
  searchType: { type: String, enum: ['prices', 'trends'], required: true },
  timestamp: { type: Date, default: Date.now }
});

MarketHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('MarketHistory', MarketHistorySchema);
