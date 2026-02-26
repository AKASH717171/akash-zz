const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    default: 'LUXE FASHION',
    maxlength: [100, 'Store name cannot exceed 100 characters'],
  },
  tagline: {
    type: String,
    trim: true,
    default: 'Elegance Redefined',
    maxlength: [200, 'Tagline cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    default: 'Premium women\'s fashion destination for bags, shoes, and clothing.',
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  logo: {
    url: {
      type: String,
      default: '',
    },
    publicId: {
      type: String,
      default: '',
    },
  },
  favicon: {
    url: {
      type: String,
      default: '',
    },
    publicId: {
      type: String,
      default: '',
    },
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'contact@luxefashion.com',
  },
  supportEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'support@luxefashion.com',
  },
  phone: {
    type: String,
    trim: true,
    default: '+880 1234-567890',
  },
  whatsapp: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    street: {
      type: String,
      trim: true,
      default: '123 Fashion Street',
    },
    city: {
      type: String,
      trim: true,
      default: 'Dhaka',
    },
    state: {
      type: String,
      trim: true,
      default: 'Dhaka Division',
    },
    postalCode: {
      type: String,
      trim: true,
      default: '1000',
    },
    country: {
      type: String,
      trim: true,
      default: 'Bangladesh',
    },
  },
  socialLinks: {
    facebook: {
      type: String,
      trim: true,
      default: '',
    },
    instagram: {
      type: String,
      trim: true,
      default: '',
    },
    twitter: {
      type: String,
      trim: true,
      default: '',
    },
    youtube: {
      type: String,
      trim: true,
      default: '',
    },
    pinterest: {
      type: String,
      trim: true,
      default: '',
    },
    tiktok: {
      type: String,
      trim: true,
      default: '',
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
  },
  shipping: {
    freeShippingThreshold: {
      type: Number,
      default: 50,
      min: [0, 'Threshold cannot be negative'],
    },
    flatShippingRate: {
      type: Number,
      default: 9.99,
      min: [0, 'Shipping rate cannot be negative'],
    },
    expressShippingRate: {
      type: Number,
      default: 19.99,
      min: [0, 'Express rate cannot be negative'],
    },
    estimatedDeliveryDays: {
      type: Number,
      default: 5,
      min: [1, 'Delivery days must be at least 1'],
    },
    expressDeliveryDays: {
      type: Number,
      default: 2,
      min: [1, 'Express delivery days must be at least 1'],
    },
  },
  currency: {
    code: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
    },
    symbol: {
      type: String,
      default: '$',
      trim: true,
    },
    position: {
      type: String,
      enum: ['before', 'after'],
      default: 'before',
    },
  },
  tax: {
    enabled: {
      type: Boolean,
      default: false,
    },
    rate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
    },
    inclusive: {
      type: Boolean,
      default: true,
    },
  },
  orderSettings: {
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order cannot be negative'],
    },
    maxOrderAmount: {
      type: Number,
      default: 500000,
      min: [0, 'Maximum order cannot be negative'],
    },
    autoConfirmOrder: {
      type: Boolean,
      default: false,
    },
    orderPrefix: {
      type: String,
      default: 'LF',
      trim: true,
      uppercase: true,
    },
  },
  seo: {
    metaTitle: {
      type: String,
      default: 'LUXE FASHION - Premium Women\'s Fashion',
      trim: true,
    },
    metaDescription: {
      type: String,
      default: 'Shop the latest women\'s fashion, bags, shoes, and accessories at LUXE FASHION. Premium quality, affordable prices.',
      trim: true,
    },
    metaKeywords: {
      type: [String],
      default: ['women fashion', 'bags', 'shoes', 'luxe fashion', 'online shopping'],
    },
    googleAnalyticsId: {
      type: String,
      default: '',
      trim: true,
    },
    facebookPixelId: {
      type: String,
      default: '',
      trim: true,
    },
  },
  maintenance: {
    enabled: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: 'We are currently performing maintenance. Please check back soon.',
      trim: true,
    },
  },
  notifications: {
    orderConfirmation: {
      type: Boolean,
      default: true,
    },
    orderShipped: {
      type: Boolean,
      default: true,
    },
    orderDelivered: {
      type: Boolean,
      default: true,
    },
    newUserWelcome: {
      type: Boolean,
      default: true,
    },
    lowStockAlert: {
      type: Boolean,
      default: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Threshold cannot be negative'],
    },
  },
}, {
  timestamps: true,
  collection: 'settings',
});

settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;