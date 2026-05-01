const mongoose = require('mongoose');

const FertilizerHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  primaryIssue: { type: Object },
  overallHealth: { type: String },
  urgency: { type: String },
  timestamp: { type: Date, default: Date.now }
});

FertilizerHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('FertilizerHistory', FertilizerHistorySchema);
