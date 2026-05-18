const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// GET /labour/test
router.get('/test', (req, res) => res.send('Labour service is working!'));

// GET /labour/jobs
router.get('/jobs', async (req, res) => {
  try {
    if (!Job) throw new Error('Job model is not defined');
    
    const { district, state, category, page = 1, limit = 20 } = req.query;
    const filter = { status: 'open' };
    if (district) filter['location.district'] = new RegExp(district, 'i');
    if (state)    filter['location.state']    = new RegExp(state, 'i');
    if (category) filter.category             = category;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 20);
    const skip = (p - 1) * l;
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).select('-applications').lean(),
      Job.countDocuments(filter),
    ]);

    res.json({ 
      success: true, 
      data: jobs, 
      pagination: { 
        page: p, 
        limit: l, 
        total, 
        pages: Math.ceil(total / l) || 0 
      } 
    });
  } catch (err) {
    console.error('💥 [JOBS ROUTE ERROR]:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database error occurred. Please check database logs.'
    });
  }
});

// POST /labour/jobs
router.post('/jobs', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.headers['user-id'];
    if (!userId) {
      console.warn('⚠️ No userId provided in headers for job post');
    }

    const { district, state, village, lat, lng, ...rest } = req.body;
    
    // Support flat location from frontend mapping to nested schema
    const jobData = {
      ...rest,
      postedBy: userId || 'anonymous', // Fallback for stability during testing
      location: {
        district: district || req.body.location?.district || 'Unknown',
        state:    state    || req.body.location?.state    || 'Unknown',
        village:  village  || req.body.location?.village  || '',
        lat:      lat      || req.body.location?.lat,
        lng:      lng      || req.body.location?.lng,
      }
    };
    
    console.log('📝 Creating Job with data:', JSON.stringify(jobData, null, 2));
    
    const job = new Job(jobData);
    await job.save();
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    console.error('💥 [JOB POST ERROR]:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to post job. Please try again.'
    });
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
