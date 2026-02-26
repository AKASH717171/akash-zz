const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getDashboardStats,
  getSalesGraph,
  getTopProducts,
  updatePaymentStatus,
} = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/auth');

// Admin routes (MUST come before /:id)
router.get('/admin/dashboard-stats', protect, isAdmin, getDashboardStats);
router.get('/admin/sales-graph', protect, isAdmin, getSalesGraph);
router.get('/admin/top-products', protect, isAdmin, getTopProducts);
router.get('/admin/all', protect, isAdmin, getAllOrders);
router.get('/admin/:id', protect, isAdmin, getOrderDetails);
router.put('/admin/:id/status', protect, isAdmin, updateOrderStatus);
router.put('/admin/:id/payment', protect, isAdmin, updatePaymentStatus);

// User routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;