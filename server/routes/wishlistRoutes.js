const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  checkWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWishlist);
router.post('/toggle', protect, toggleWishlist);
router.get('/check/:productId', protect, checkWishlist);
router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;