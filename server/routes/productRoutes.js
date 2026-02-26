const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductBySlug,
  getProductById,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getSaleProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  updateProductStock,
  bulkUpdateStatus,
  bulkDeleteProducts,
  getFilterOptions,
} = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/auth');

// Public collection routes (MUST come before /:slug)
router.get('/collection/featured', getFeaturedProducts);
router.get('/collection/new-arrivals', getNewArrivals);
router.get('/collection/best-sellers', getBestSellers);
router.get('/collection/sale', getSaleProducts);
router.get('/filters/options', getFilterOptions);

// Admin routes (MUST come before /:slug)
router.get('/admin/all', protect, isAdmin, getAdminProducts);
router.put('/bulk/status', protect, isAdmin, bulkUpdateStatus);
router.delete('/bulk/delete', protect, isAdmin, bulkDeleteProducts);

// Public routes
router.get('/', getAllProducts);
router.get('/id/:id', getProductById);
router.get('/:slug', getProductBySlug);
router.get('/:slug/related', getRelatedProducts);  // slug OR id দুটোই কাজ করবে

// Admin CRUD routes
router.post('/', protect, isAdmin, createProduct);
router.put('/:id', protect, isAdmin, updateProduct);
router.put('/:id/stock', protect, isAdmin, updateProductStock);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;