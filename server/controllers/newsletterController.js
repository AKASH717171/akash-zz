const Newsletter = require('../models/Newsletter');
const validator = require('validator');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existing) {
      if (existing.status === 'subscribed') {
        return res.status(400).json({
          success: false,
          message: 'This email is already subscribed to our newsletter.',
        });
      }

      // Re-subscribe
      existing.status = 'subscribed';
      existing.subscribedAt = new Date();
      existing.unsubscribedAt = null;
      if (name) existing.name = name.trim();
      await existing.save();

      return res.status(200).json({
        success: true,
        message: 'Welcome back! You have been re-subscribed. 🎉',
      });
    }

    await Newsletter.create({
      email: email.toLowerCase().trim(),
      name: name ? name.trim() : '',
      status: 'subscribed',
      subscribedAt: new Date(),
      source: req.body.source || 'website',
      ipAddress: req.ip || req.connection.remoteAddress || '',
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed! Welcome to LUXE FASHION. 🎉',
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again.',
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const subscriber = await Newsletter.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our subscriber list.',
      });
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'You have been unsubscribed. We are sorry to see you go.',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe.',
    });
  }
};

// @desc    Get all subscribers (admin)
// @route   GET /api/newsletter/admin/all
// @access  Private/Admin
const getAllSubscribers = async (req, res) => {
  try {
    const { search, status, source, sort, page = 1, limit = 30 } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (source && source !== 'all') {
      filter.source = source;
    }

    let sortOption = { subscribedAt: -1 };
    if (sort === 'oldest') sortOption = { subscribedAt: 1 };
    if (sort === 'email') sortOption = { email: 1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [subscribers, totalItems] = await Promise.all([
      Newsletter.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Newsletter.countDocuments(filter),
    ]);

    const totalSubscribed = await Newsletter.countDocuments({ status: 'subscribed' });
    const totalUnsubscribed = await Newsletter.countDocuments({ status: 'unsubscribed' });

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
      stats: {
        totalSubscribed,
        totalUnsubscribed,
        total: totalItems,
      },
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get all subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers.',
    });
  }
};

// @desc    Delete subscriber (admin)
// @route   DELETE /api/newsletter/:id
// @access  Private/Admin
const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Newsletter.findById(req.params.id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found.',
      });
    }

    await Newsletter.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully!',
    });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber.',
    });
  }
};

// @desc    Export subscribers (admin)
// @route   GET /api/newsletter/admin/export
// @access  Private/Admin
const exportSubscribers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const subscribers = await Newsletter.find(filter)
      .select('email name status subscribedAt source')
      .sort({ subscribedAt: -1 })
      .lean();

    // CSV format
    let csv = 'Email,Name,Status,Subscribed At,Source\n';
    subscribers.forEach((sub) => {
      csv += `${sub.email},"${sub.name || ''}",${sub.status},${sub.subscribedAt ? new Date(sub.subscribedAt).toISOString() : ''},${sub.source || ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=newsletter-subscribers.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export subscribers.',
    });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
  exportSubscribers,
};