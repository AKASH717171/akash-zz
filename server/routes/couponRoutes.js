const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, isAdmin } = require('../middleware/auth');

// User route
router.post('/validate', protect, validateCoupon);

// Admin routes
router.get('/admin/all', protect, isAdmin, getAllCoupons);
router.get('/admin/:id', protect, isAdmin, getCouponById);
router.post('/', protect, isAdmin, createCoupon);
router.put('/:id', protect, isAdmin, updateCoupon);
router.delete('/:id', protect, isAdmin, deleteCoupon);

module.exports = router;