const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: {
    url: {
      type: String,
      required: [true, 'Banner image URL is required'],
    },
    publicId: {
      type: String,
      default: '',
    },
  },
  mobileImage: {
    url: {
      type: String,
      default: '',
    },
    publicId: {
      type: String,
      default: '',
    },
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: '',
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [500, 'Subtitle cannot exceed 500 characters'],
    default: '',
  },
  ctaText: {
    type: String,
    trim: true,
    maxlength: [50, 'CTA text cannot exceed 50 characters'],
    default: 'Shop Now',
  },
  ctaLink: {
    type: String,
    trim: true,
    default: '/shop',
  },
  secondaryCtaText: {
    type: String,
    trim: true,
    maxlength: [50, 'Secondary CTA text cannot exceed 50 characters'],
    default: '',
  },
  secondaryCtaLink: {
    type: String,
    trim: true,
    default: '',
  },
  textColor: {
    type: String,
    trim: true,
    default: '#FFFFFF',
  },
  overlayColor: {
    type: String,
    trim: true,
    default: 'rgba(0,0,0,0.3)',
  },
  textPosition: {
    type: String,
    enum: ['left', 'center', 'right'],
    default: 'center',
  },
  order: {
    type: Number,
    default: 0,
    min: [0, 'Order cannot be negative'],
  },
  type: {
    type: String,
    enum: {
      values: ['hero', 'promotional', 'category', 'sale'],
      message: '{VALUE} is not a valid banner type',
    },
    default: 'hero',
  },
  active: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

bannerSchema.index({ order: 1 });
bannerSchema.index({ active: 1 });
bannerSchema.index({ type: 1 });

bannerSchema.virtual('isCurrentlyActive').get(function () {
  if (!this.active) return false;
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;