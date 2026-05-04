const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// GET /labour/jobs
router.get('/jobs', async (req, res) => {
  try {
    const { district, state, category, page = 1, limit = 20 } = req.query;
    const filter = { status: 'open' };
    if (district) filter['location.district'] = new RegExp(district, 'i');
    if (state)    filter['location.state']    = new RegExp(state, 'i');
    if (category) filter.category             = category;

    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-applications'),
      Job.countDocuments(filter),
    ]);

    res.json({ success: true, data: jobs, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /labour/jobs
router.post('/jobs', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { district, state, village, lat, lng, ...rest } = req.body;
    
    // Support flat location from frontend mapping to nested schema
    const jobData = {
      ...rest,
      postedBy: userId,
      location: {
        district: district || req.body.location?.district,
        state:    state    || req.body.location?.state,
        village:  village  || req.body.location?.village,
        lat:      lat      || req.body.location?.lat,
        lng:      lng      || req.body.location?.lng,
      }
    };
    
    const job = new Job(jobData);
    await job.save();
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    console.error('Job post error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /labour/jobs/:id
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /labour/jobs/:id/apply
router.post('/jobs/:id/apply', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { name, phone, message } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const alreadyApplied = job.applications.some(a => a.userId === userId);
    if (alreadyApplied) return res.status(400).json({ success: false, message: 'Already applied' });

    job.applications.push({ userId, name, phone, message });
    await job.save();
    res.json({ success: true, message: 'Application submitted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /labour/my-jobs — jobs posted by current user
router.get('/my-jobs', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const jobs = await Job.find({ postedBy: userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /labour/jobs/:id/status
router.patch('/jobs/:id/status', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { status } = req.body;
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: userId },
      { status },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /labour/map-markers
router.get('/map-markers', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' }).limit(50);
    const markers = jobs
      .filter(j => j.location && j.location.lat && j.location.lng)
      .map(j => ({
        lat: j.location.lat,
        lng: j.location.lng,
        type: 'labour',
        title: j.title,
        info: `${j.category} · ₹${j.wage}/${j.wageUnit}`,
        detail: `Location: ${j.location.village || j.location.district} · Needed: ${j.workersNeeded} workers`
      }));
    res.json({ success: true, data: markers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
