const Coupon = require('../models/Coupon');
const Category = require('../models/Category');

// @desc    Validate coupon (user)
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal, cartItems } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a coupon code.',
      });
    }

    if (!cartTotal || cartTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart total must be greater than 0.',
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code. Please check and try again.',
      });
    }

    // Check active status
    if (coupon.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This coupon is no longer active.',
      });
    }

    // Check dates
    const now = new Date();

    if (now < coupon.startDate) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not yet active.',
      });
    }

    if (now > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired.',
      });
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its maximum usage limit.',
      });
    }

    // Check per-user limit
    if (!coupon.canBeUsedByUser(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: `You have already used this coupon ${coupon.perUserLimit} time(s).`,
      });
    }

    // Check minimum order amount
    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of $${coupon.minOrderAmount.toFixed(2)} required. Your cart total is $${cartTotal.toFixed(2)}.`,
      });
    }

    // Check applicable categories
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0 && cartItems) {
      // Verify at least one cart item belongs to applicable categories
      const applicableCategoryIds = coupon.applicableCategories.map((c) => c.toString());
      const hasApplicableItem = cartItems.some(
        (item) => item.category && applicableCategoryIds.includes(item.category.toString())
      );

      if (!hasApplicableItem) {
        const categories = await Category.find({
          _id: { $in: coupon.applicableCategories },
        }).select('name');
        const categoryNames = categories.map((c) => c.name).join(', ');

        return res.status(400).json({
          success: false,
          message: `This coupon is only valid for: ${categoryNames}.`,
        });
      }
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cartTotal);

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully! 🎉',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minOrderAmount: coupon.minOrderAmount,
        description: coupon.description,
      },
      discount,
      newTotal: Math.max(0, cartTotal - discount),
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon.',
    });
  }
};

// @desc    Get all coupons (admin)
// @route   GET /api/coupons/admin/all
// @access  Private/Admin
const getAllCoupons = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      if (status === 'expired') {
        filter.expiryDate = { $lt: new Date() };
      } else {
        filter.status = status;
      }
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [coupons, totalItems] = await Promise.all([
      Coupon.find(filter)
        .populate('applicableCategories', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Coupon.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get all coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons.',
    });
  }
};

// @desc    Get coupon by ID (admin)
// @route   GET /api/coupons/admin/:id
// @access  Private/Admin
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('applicableCategories', 'name slug')
      .lean({ virtuals: true });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error('Get coupon by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid coupon ID.' });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon.',
    });
  }
};

// @desc    Create coupon (admin)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startDate,
      expiryDate,
      applicableCategories,
      status,
    } = req.body;

    if (!code || code.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code must be at least 3 characters.',
      });
    }

    if (!discountValue || discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value must be greater than 0.',
      });
    }

    if (!expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date is required.',
      });
    }

    // Check duplicate code
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'A coupon with this code already exists.',
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description: description ? description.trim() : '',
      discountType: discountType || 'percentage',
      discountValue: parseFloat(discountValue),
      minOrderAmount: parseFloat(minOrderAmount) || 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      perUserLimit: parseInt(perUserLimit) || 1,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: new Date(expiryDate),
      applicableCategories: applicableCategories || [],
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully!',
      coupon,
    });
  } catch (error) {
    console.error('Create coupon error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A coupon with this code already exists.',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create coupon.',
    });
  }
};

// @desc    Update coupon (admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    const updateFields = [
      'description', 'discountType', 'discountValue', 'minOrderAmount',
      'maxDiscount', 'usageLimit', 'perUserLimit', 'startDate',
      'expiryDate', 'applicableCategories', 'status',
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'expiryDate') {
          coupon[field] = new Date(req.body[field]);
        } else if (['discountValue', 'minOrderAmount', 'maxDiscount'].includes(field)) {
          coupon[field] = req.body[field] === null ? null : parseFloat(req.body[field]);
        } else if (['usageLimit', 'perUserLimit'].includes(field)) {
          coupon[field] = req.body[field] === null ? null : parseInt(req.body[field]);
        } else {
          coupon[field] = req.body[field];
        }
      }
    });

    // Code change check
    if (req.body.code && req.body.code.toUpperCase().trim() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: req.body.code.toUpperCase().trim(),
        _id: { $ne: coupon._id },
      });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Another coupon with this code already exists.',
        });
      }
      coupon.code = req.body.code.toUpperCase().trim();
    }

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully!',
      coupon,
    });
  } catch (error) {
    console.error('Update coupon error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update coupon.',
    });
  }
};

// @desc    Delete coupon (admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully!',
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon.',
    });
  }
};

module.exports = {
  validateCoupon,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};