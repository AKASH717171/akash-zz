const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminCategories,
  reorderCategories,
} = require('../controllers/categoryController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);
router.get('/id/:id', getCategoryById);

// Admin routes
router.get('/admin/all', protect, isAdmin, getAdminCategories);
router.post('/', protect, isAdmin, createCategory);
router.put('/reorder', protect, isAdmin, reorderCategories);
router.put('/:id', protect, isAdmin, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

module.exports = router;