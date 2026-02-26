const Banner = require('../models/Banner');

// @desc    Get active banners (public)
// @route   GET /api/banners
// @access  Public
const getActiveBanners = async (req, res) => {
  try {
    const { type } = req.query;

    const now = new Date();

    const filter = {
      active: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $gte: now } },
      ],
    };

    if (type) {
      filter.type = type;
    }

    const banners = await Banner.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error('Get active banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners.',
    });
  }
};

// @desc    Get all banners (admin)
// @route   GET /api/banners/admin/all
// @access  Private/Admin
const getAllBanners = async (req, res) => {
  try {
    const { type, active, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (active !== undefined && active !== '') {
      filter.active = active === 'true';
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [banners, totalItems] = await Promise.all([
      Banner.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Banner.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get all banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners.',
    });
  }
};

// @desc    Get banner by ID (admin)
// @route   GET /api/banners/admin/:id
// @access  Private/Admin
const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found.',
      });
    }

    res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error('Get banner by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid banner ID.' });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner.',
    });
  }
};

// @desc    Create banner (admin)
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = async (req, res) => {
  try {
    const {
      image,
      mobileImage,
      title,
      subtitle,
      ctaText,
      ctaLink,
      secondaryCtaText,
      secondaryCtaLink,
      textColor,
      overlayColor,
      textPosition,
      order,
      type,
      active,
      startDate,
      endDate,
    } = req.body;

    if (!image || !image.url) {
      return res.status(400).json({
        success: false,
        message: 'Banner image is required.',
      });
    }

    // Auto-determine order
    let bannerOrder = order;
    if (bannerOrder === undefined || bannerOrder === null) {
      const lastBanner = await Banner.findOne().sort({ order: -1 });
      bannerOrder = lastBanner ? lastBanner.order + 1 : 1;
    }

    const banner = await Banner.create({
      image,
      mobileImage: mobileImage || { url: '', publicId: '' },
      title: title ? title.trim() : '',
      subtitle: subtitle ? subtitle.trim() : '',
      ctaText: ctaText ? ctaText.trim() : 'Shop Now',
      ctaLink: ctaLink ? ctaLink.trim() : '/shop',
      secondaryCtaText: secondaryCtaText ? secondaryCtaText.trim() : '',
      secondaryCtaLink: secondaryCtaLink ? secondaryCtaLink.trim() : '',
      textColor: textColor || '#FFFFFF',
      overlayColor: overlayColor || 'rgba(0,0,0,0.3)',
      textPosition: textPosition || 'center',
      order: parseInt(bannerOrder),
      type: type || 'hero',
      active: active !== undefined ? active : true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully!',
      banner,
    });
  } catch (error) {
    console.error('Create banner error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create banner.',
    });
  }
};

// @desc    Update banner (admin)
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found.',
      });
    }

    const updateFields = [
      'image', 'mobileImage', 'title', 'subtitle', 'ctaText', 'ctaLink',
      'secondaryCtaText', 'secondaryCtaLink', 'textColor', 'overlayColor',
      'textPosition', 'order', 'type', 'active', 'startDate', 'endDate',
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          banner[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else if (field === 'order') {
          banner[field] = parseInt(req.body[field]);
        } else if (typeof req.body[field] === 'string') {
          banner[field] = req.body[field].trim();
        } else {
          banner[field] = req.body[field];
        }
      }
    });

    await banner.save();

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully!',
      banner,
    });
  } catch (error) {
    console.error('Update banner error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update banner.',
    });
  }
};

// @desc    Delete banner (admin)
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found.',
      });
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully!',
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner.',
    });
  }
};

// @desc    Reorder banners (admin)
// @route   PUT /api/banners/reorder
// @access  Private/Admin
const reorderBanners = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of banner orders.',
      });
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await Banner.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Banners reordered successfully!',
    });
  } catch (error) {
    console.error('Reorder banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder banners.',
    });
  }
};

module.exports = {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
};