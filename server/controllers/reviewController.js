const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get product reviews (public — approved only)
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sort, page = 1, limit = 10 } = req.query;

    const filter = {
      product: productId,
      status: 'approved',
    };

    let sortOption = { createdAt: -1 };
    if (sort === 'rating_high') sortOption = { rating: -1 };
    if (sort === 'rating_low') sortOption = { rating: 1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'helpful') sortOption = { helpfulCount: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, totalItems] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .populate('adminReply.repliedBy', 'name')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(filter),
    ]);

    // Rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { product: new (require('mongoose').Types.ObjectId)(productId), status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const distribution = {};
    let totalRatings = 0;
    let sumRatings = 0;
    for (let i = 5; i >= 1; i--) {
      const found = ratingStats.find((r) => r._id === i);
      distribution[i] = found ? found.count : 0;
      totalRatings += distribution[i];
      sumRatings += i * distribution[i];
    }

    const averageRating = totalRatings > 0
      ? Math.round((sumRatings / totalRatings) * 10) / 10
      : 0;

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
      stats: {
        averageRating,
        totalReviews: totalRatings,
        distribution,
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
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews.',
    });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.',
      });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Review comment must be at least 10 characters.',
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product. You can only submit one review per product.',
      });
    }

    // Check if user purchased this product (verified purchase)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: 'delivered',
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: parseInt(rating),
      title: title ? title.trim() : '',
      comment: comment.trim(),
      status: 'pending',
      isVerifiedPurchase: !!hasPurchased,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will appear after admin approval.',
      review: populatedReview,
    });
  } catch (error) {
    console.error('Create review error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product.',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit review.',
    });
  }
};

// @desc    Get all reviews (admin)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    const { status, rating, product, search, sort, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (rating) {
      filter.rating = parseInt(rating);
    }

    if (product) {
      filter.product = product;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'rating_high') sortOption = { rating: -1 };
    if (sort === 'rating_low') sortOption = { rating: 1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, totalItems] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name email avatar')
        .populate('product', 'title slug images')
        .populate('adminReply.repliedBy', 'name')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(filter),
    ]);

    // Status counts
    const statusCounts = await Review.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = {};
    statusCounts.forEach((s) => { statusMap[s._id] = s.count; });

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
      statusCounts: statusMap,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews.',
    });
  }
};

// @desc    Update review status (admin — approve/reject)
// @route   PUT /api/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    review.status = status;
    await review.save();

    // Product rating will auto-update via post-save hook

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name email avatar')
      .populate('product', 'title slug');

    res.status(200).json({
      success: true,
      message: `Review ${status} successfully!`,
      review: updatedReview,
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review status.',
    });
  }
};

// @desc    Reply to review (admin)
// @route   PUT /api/reviews/:id/reply
// @access  Private/Admin
const replyToReview = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Reply comment is required.',
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    review.adminReply = {
      comment: comment.trim(),
      repliedAt: new Date(),
      repliedBy: req.user._id,
    };

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name email avatar')
      .populate('product', 'title slug')
      .populate('adminReply.repliedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Reply added successfully!',
      review: updatedReview,
    });
  } catch (error) {
    console.error('Reply to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply.',
    });
  }
};

// @desc    Delete review (admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(req.params.id);

    // Recalculate product rating
    await Product.calcAverageRatings(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully!',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review.',
    });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  getAllReviews,
  updateReviewStatus,
  replyToReview,
  deleteReview,
};