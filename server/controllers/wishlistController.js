const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'title slug images regularPrice salePrice discountPercent ratings stock status category tags featured newArrival',
      populate: {
        path: 'category',
        select: 'name slug',
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Filter out inactive products
    const activeWishlist = user.wishlist.filter(
      (product) => product && product.status === 'active'
    );

    // If any items were removed because inactive, update user wishlist
    if (activeWishlist.length !== user.wishlist.length) {
      user.wishlist = activeWishlist.map((p) => p._id);
      await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      count: activeWishlist.length,
      wishlist: activeWishlist,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist.',
    });
  }
};

// @desc    Toggle product in wishlist (add/remove)
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const user = await User.findById(req.user._id);

    const wishlistIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let action;

    if (wishlistIndex > -1) {
      // Remove from wishlist
      user.wishlist.splice(wishlistIndex, 1);
      action = 'removed';
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: action === 'added'
        ? `"${product.title}" added to wishlist! ❤️`
        : `"${product.title}" removed from wishlist.`,
      action,
      wishlist: user.wishlist,
      wishlistCount: user.wishlist.length,
    });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update wishlist.',
    });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    const index = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist.',
      });
    }

    user.wishlist.splice(index, 1);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist.',
      wishlist: user.wishlist,
      wishlistCount: user.wishlist.length,
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist.',
    });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id).select('wishlist');

    const isInWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    res.status(200).json({
      success: true,
      isInWishlist,
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist.',
    });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  checkWishlist,
};