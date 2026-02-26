const express = require('express');
const router = express.Router();
const {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
} = require('../controllers/bannerController');
const { protect, isAdmin } = require('../middleware/auth');

// Public
router.get('/', getActiveBanners);

// Admin
router.get('/admin/all', protect, isAdmin, getAllBanners);
router.get('/admin/:id', protect, isAdmin, getBannerById);
router.post('/', protect, isAdmin, createBanner);
router.put('/reorder', protect, isAdmin, reorderBanners);
router.put('/:id', protect, isAdmin, updateBanner);
router.delete('/:id', protect, isAdmin, deleteBanner);

module.exports = router;