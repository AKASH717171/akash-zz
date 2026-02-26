const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [30, 'Coupon code cannot exceed 30 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  discountType: {
    type: String,
    required: [true, 'Discount type is required'],
    enum: {
      values: ['percentage', 'fixed'],
      message: '{VALUE} is not a valid discount type',
    },
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative'],
    validate: {
      validator: function (value) {
        if (this.discountType === 'percentage' && value > 100) {
          return false;
        }
        return true;
      },
      message: 'Percentage discount cannot exceed 100%',
    },
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative'],
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: [0, 'Maximum discount cannot be negative'],
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1'],
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative'],
  },
  perUserLimit: {
    type: Number,
    default: 1,
    min: [1, 'Per user limit must be at least 1'],
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
    orderNumber: {
      type: String,
      default: '',
    },
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function (value) {
        return value > this.startDate;
      },
      message: 'Expiry date must be after start date',
    },
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'expired'],
      message: '{VALUE} is not a valid status',
    },
    default: 'active',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

couponSchema.index({ status: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ startDate: 1 });

couponSchema.virtual('isValid').get(function () {
  const now = new Date();
  const notExpired = this.expiryDate > now;
  const hasStarted = this.startDate <= now;
  const isActive = this.status === 'active';
  const hasUsagesLeft = this.usageLimit === null || this.usedCount < this.usageLimit;
  return notExpired && hasStarted && isActive && hasUsagesLeft;
});

couponSchema.virtual('remainingUses').get(function () {
  if (this.usageLimit === null) return null;
  return Math.max(0, this.usageLimit - this.usedCount);
});

couponSchema.methods.canBeUsedByUser = function (userId) {
  if (!this.isValid) return false;

  const userUsages = this.usedBy.filter(
    (usage) => usage.user.toString() === userId.toString()
  ).length;

  return userUsages < this.perUserLimit;
};

couponSchema.methods.calculateDiscount = function (orderAmount) {
  if (orderAmount < this.minOrderAmount) return 0;

  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }

  if (discount > orderAmount) {
    discount = orderAmount;
  }

  return Math.round(discount * 100) / 100;
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;