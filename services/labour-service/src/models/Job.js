const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  postedBy:    { type: String, required: true },  // userId
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    {
    type: String,
    enum: ['harvesting', 'sowing', 'irrigation', 'pesticide', 'transport', 'storage', 'other'],
    default: 'other',
  },
  location: {
    village:  { type: String },
    district: { type: String, required: true },
    state:    { type: String, required: true },
    lat:      { type: Number },
    lng:      { type: Number },
  },
  wage:       { type: Number, required: true },
  wageUnit:   { type: String, enum: ['per day', 'per week', 'per month', 'fixed'], default: 'per day' },
  workersNeeded: { type: Number, default: 1 },
  duration:   { type: String },
  startDate:  { type: Date },
  skills:     [{ type: String }],
  contactNumber: { type: String, required: true },
  image:         { type: String }, // Base64 or URL
  status:     { type: String, enum: ['open', 'filled', 'closed'], default: 'open' },
  applications: [{
    userId:    String,
    name:      String,
    phone:     String,
    message:   String,
    appliedAt: { type: Date, default: Date.now },
    status:    { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  }],
}, { timestamps: true });

jobSchema.index({ 'location.district': 1, status: 1 });
jobSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
