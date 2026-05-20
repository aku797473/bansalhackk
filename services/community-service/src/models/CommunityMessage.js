const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    required: true
  },
  senderImage: {
    type: String,
    default: null
  },
  message: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('CommunityMessage', communityMessageSchema);
