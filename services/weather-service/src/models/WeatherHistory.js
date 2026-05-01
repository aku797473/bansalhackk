const mongoose = require('mongoose');

const WeatherHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  city: { type: String },
  lat: { type: Number },
  lon: { type: Number },
  temperature: { type: Number },
  description: { type: String },
  searchType: { type: String, enum: ['current', 'by-city'], required: true },
  timestamp: { type: Date, default: Date.now }
});

WeatherHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('WeatherHistory', WeatherHistorySchema);
