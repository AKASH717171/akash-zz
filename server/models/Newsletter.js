const mongoose = require('mongoose');
const validator = require('validator');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email address',
    },
  },
  name: {
    type: String,
    trim: true,
    default: '',
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  status: {
    type: String,
    enum: {
      values: ['subscribed', 'unsubscribed', 'bounced'],
      message: '{VALUE} is not a valid status',
    },
    default: 'subscribed',
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  unsubscribedAt: {
    type: Date,
    default: null,
  },
  source: {
    type: String,
    trim: true,
    default: 'website',
    enum: ['website', 'checkout', 'popup', 'footer', 'import', 'manual'],
  },
  ipAddress: {
    type: String,
    trim: true,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

newsletterSchema.index({ email: 1 });
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ subscribedAt: -1 });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = Newsletter;