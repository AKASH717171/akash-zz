const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
  getDashboardStats,
  getSalesGraph,
  getTopProducts,
} = require('../controllers/orderController');

router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/sales-graph', protect, isAdmin, getSalesGraph);
router.get('/top-products', protect, isAdmin, getTopProducts);

module.exports = router;
