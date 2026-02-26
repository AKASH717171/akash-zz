const express = require('express');
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
  exportSubscribers,
} = require('../controllers/newsletterController');
const { protect, isAdmin } = require('../middleware/auth');

// Public
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin
router.get('/admin/all', protect, isAdmin, getAllSubscribers);
router.get('/admin/export', protect, isAdmin, exportSubscribers);
router.delete('/:id', protect, isAdmin, deleteSubscriber);

module.exports = router;