const mongoose = require('mongoose');

// --- MongoDB Configuration ---
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  cachedDb = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return cachedDb;
}

const JobSchema = new mongoose.Schema({
  postedBy: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['harvesting', 'sowing', 'irrigation', 'pesticide', 'transport', 'storage', 'other'], default: 'other' },
  location: {
    village: { type: String }, district: { type: String, required: true },
    state: { type: String, required: true }, lat: { type: Number }, lng: { type: Number },
  },
  wage: { type: Number, required: true },
  wageUnit: { type: String, enum: ['per day', 'per week', 'per month', 'fixed'], default: 'per day' },
  workersNeeded: { type: Number, default: 1 },
  duration: { type: String },
  startDate: { type: Date },
  skills: [{ type: String }],
  contactNumber: { type: String, required: true },
  status: { type: String, enum: ['open', 'filled', 'closed'], default: 'open' },
  applications: [{
    userId: String, name: String, phone: String, message: String,
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  }],
}, { timestamps: true });

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectToDatabase();
    const { id, path: qPath } = req.query;
    const endpoint = req.url.split('?')[0].split('/').pop();
    const userId = req.headers['x-user-id'] || 'anonymous';

    // GET /labour/jobs
    if (req.method === 'GET' && endpoint === 'jobs') {
      const { district, state, category } = req.query;
      const filter = { status: 'open' };
      if (district) filter['location.district'] = new RegExp(district, 'i');
      if (state) filter['location.state'] = new RegExp(state, 'i');
      if (category) filter.category = category;
      const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(20);
      return res.json({ success: true, data: jobs });
    }

    // POST /labour/jobs
    if (req.method === 'POST' && endpoint === 'jobs') {
      const job = new Job({ ...req.body, postedBy: userId });
      await job.save();
      return res.status(201).json({ success: true, data: job });
    }

    // GET /labour/map-markers
    if (req.method === 'GET' && endpoint === 'map-markers') {
      const jobs = await Job.find({ status: 'open' }).limit(50);
      const markers = jobs.filter(j => j.location?.lat).map(j => ({
        lat: j.location.lat, lng: j.location.lng, type: 'labour', title: j.title,
        info: `${j.category} · ₹${j.wage}/${j.wageUnit}`,
        detail: `${j.location.village || j.location.district} · ${j.workersNeeded} workers`
      }));
      return res.json({ success: true, data: markers });
    }

    // Handle nested routes like /jobs/:id and /jobs/:id/apply
    // Since vercel.json routes /api/labour/:path* to api/labour.js
    const segments = req.url.split('?')[0].split('/').filter(Boolean);
    // segments will be ['api', 'labour', 'jobs', 'ID', 'apply']
    if (segments[2] === 'jobs' && segments[3]) {
      const jobId = segments[3];
      if (segments[4] === 'apply' && req.method === 'POST') {
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        job.applications.push({ ...req.body, userId });
        await job.save();
        return res.json({ success: true, message: 'Applied' });
      }
      if (req.method === 'GET') {
        const job = await Job.findById(jobId);
        return res.json({ success: true, data: job });
      }
    }

    res.status(404).json({ success: false, message: 'Endpoint not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
