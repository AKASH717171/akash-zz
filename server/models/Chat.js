const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['visitor', 'admin', 'system', 'user', 'bot'],
    required: true,
  },
  senderName: { type: String, trim: true, default: '' },
  text:       { type: String, trim: true, default: '' },
  message:    { type: String, trim: true, default: '' },
  timestamp:  { type: Date, default: Date.now },
  read:       { type: Boolean, default: false },
});

const chatSchema = new mongoose.Schema({
  visitorId:       { type: String, index: true },
  sessionId:       { type: String, default: null },
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  visitorName:     { type: String, trim: true, default: '' },
  visitorEmail:    { type: String, trim: true, lowercase: true, default: '' },
  visitorIp:       { type: String, default: '' },
  visitorBrowser:  { type: String, default: '' },
  visitorDevice:   { type: String, default: '' },
  visitorLocation: { type: String, default: '' },
  messages:        { type: [messageSchema], default: [] },
  status: {
    type: String,
    enum: ['active', 'closed', 'waiting', 'pending'],
    default: 'active',
  },
  lastMessageAt: { type: Date, default: Date.now },
  closedAt:      { type: Date },
  closedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

chatSchema.index({ status: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ visitorId: 1, status: 1 });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;