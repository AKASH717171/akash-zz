const Settings = require('../models/Settings');

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne().lean();

    if (!settings) {
      settings = await Settings.create({});
      settings = settings.toObject();
    }

    // For public access, hide some admin-only fields
    if (!req.user || req.user.role !== 'admin') {
      delete settings.seo?.googleAnalyticsId;
      delete settings.seo?.facebookPixelId;
      delete settings.notifications;
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings.',
    });
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({});
    }

    // Deep merge function
    const deepMerge = (target, source) => {
      Object.keys(source).forEach((key) => {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key]) &&
          target[key] &&
          typeof target[key] === 'object' &&
          !Array.isArray(target[key])
        ) {
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      });
    };

    const allowedFields = [
      'storeName', 'tagline', 'description', 'logo', 'favicon',
      'contactEmail', 'supportEmail', 'phone', 'whatsapp',
      'address', 'socialLinks', 'shipping', 'currency', 'tax',
      'orderSettings', 'seo', 'maintenance', 'notifications',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === 'object' && !Array.isArray(req.body[field])) {
          if (settings[field] && typeof settings[field] === 'object') {
            deepMerge(settings[field], req.body[field]);
            settings.markModified(field);
          } else {
            settings[field] = req.body[field];
          }
        } else {
          settings[field] = req.body[field];
        }
      }
    });

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully!',
      settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update settings.',
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};