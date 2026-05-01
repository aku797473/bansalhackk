const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system', 'model'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ChatHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  messages: [MessageSchema],
  language: { type: String, default: 'hi' }
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
