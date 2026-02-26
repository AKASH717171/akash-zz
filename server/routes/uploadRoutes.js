const express = require('express');
const router = express.Router();
const {
  uploadSingle,
  uploadMultiple,
  deleteImage,
  uploadFromUrl,
} = require('../controllers/uploadController');
const { protect, isAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// All upload routes are admin-only
router.post(
  '/single',
  protect,
  isAdmin,
  upload.single('image'),
  uploadSingle
);

router.post(
  '/multiple',
  protect,
  isAdmin,
  upload.array('images', 6),
  uploadMultiple
);

router.post('/url', protect, isAdmin, uploadFromUrl);

router.delete('/', protect, isAdmin, deleteImage);

module.exports = router;