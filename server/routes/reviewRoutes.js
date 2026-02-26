const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  getAllReviews,
  updateReviewStatus,
  replyToReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, isAdmin } = require('../middleware/auth');

// Public
router.get('/product/:productId', getProductReviews);

// User
router.post('/', protect, createReview);

// Admin
router.get('/admin/all', protect, isAdmin, getAllReviews);
router.put('/:id/status', protect, isAdmin, updateReviewStatus);
router.put('/:id/reply', protect, isAdmin, replyToReview);
router.delete('/:id', protect, isAdmin, deleteReview);

module.exports = router;