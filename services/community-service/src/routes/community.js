const express = require('express');
const router = express.Router();
const CommunityMessage = require('../models/CommunityMessage');

// GET /api/community/history/:room
router.get('/history/:room', async (req, res) => {
  try {
    const { room } = req.params;
    // Get the last 100 messages for this room
    const messages = await CommunityMessage.find({ room })
      .sort({ timestamp: -1 })
      .limit(100);
    
    // Reverse to get chronological order (oldest first)
    messages.reverse();
    
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('❌ COMMUNITY HISTORY ERROR:', err);
    res.status(500).json({ success: false, message: 'History Fetch Error', error: err.message });
  }
});

module.exports = router;
