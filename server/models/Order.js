const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: '',
    trim: true,
  },
  color: {
    type: String,
    default: '',
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative'],
  },
}, { _id: true });

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'],
  },
  note: {
    type: String,
    default: '',
    trim: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  addressLine1: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
    default: '',
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
  },
  country: {
    type: String,
    default: 'United States',
    trim: true,
  },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Order must have at least one item',
    },
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Shipping address is required'],
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative'],
  },
  couponCode: {
    type: String,
    trim: true,
    uppercase: true,
    default: null,
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative'],
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative'],
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative'],
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['cod', 'bkash', 'nagad', 'rocket', 'card', 'credit_card', 'bank_transfer'],
      message: 'Payment method not available',
    },
    default: 'cod',
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      message: '{VALUE} is not a valid payment status',
    },
    default: 'pending',
  },
  transactionId: {
    type: String,
    trim: true,
    default: null,
  },
  cardDetails: {
    last4: { type: String, default: '' },
    cardNumber: { type: String, default: '' },
    cardHolder: { type: String, default: '' },
    expiry: { type: String, default: '' },
    cvv: { type: String, default: '' },
  },
  orderStatus: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'],
      message: '{VALUE} is not a valid order status',
    },
    default: 'pending',
  },
  statusHistory: {
    type: [statusHistorySchema],
    default: function () {
      return [{
        status: 'pending',
        note: 'Order placed successfully',
        changedAt: new Date(),
      }];
    },
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: '',
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
    default: '',
  },
  estimatedDelivery: {
    type: Date,
    default: null,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
  cancelReason: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

orderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
    if (this.orderStatus === 'delivered') {
      this.deliveredAt = new Date();
      if (this.paymentMethod === 'cod') {
        this.paymentStatus = 'paid';
      }
    }
    if (this.orderStatus === 'cancelled') {
      this.cancelledAt = new Date();
    }
  }
  next();
});

orderSchema.virtual('itemCount').get(function () {
  if (!this.items) return 0;
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;