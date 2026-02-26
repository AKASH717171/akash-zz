const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Review title cannot exceed 200 characters'],
    default: '',
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters'],
  },
  images: [{
    url: {
      type: String,
      default: '',
    },
    publicId: {
      type: String,
      default: '',
    },
  }],
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: '{VALUE} is not a valid status',
    },
    default: 'pending',
  },
  adminReply: {
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Admin reply cannot exceed 1000 characters'],
      default: '',
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: [0, 'Helpful count cannot be negative'],
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: -1 });

reviewSchema.post('save', async function () {
  const Product = mongoose.model('Product');
  await Product.calcAverageRatings(this.product);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const Product = mongoose.model('Product');
    await Product.calcAverageRatings(doc.product);
  }
});

reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    const Product = mongoose.model('Product');
    await Product.calcAverageRatings(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;