const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
const subDirs = ['products', 'categories', 'banners', 'avatars', 'general'];
subDirs.forEach((dir) => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine subfolder based on request body or default
    let folder = 'general';
    if (req.body && req.body.folder) {
      // Extract last part of folder path for local storage
      const parts = req.body.folder.split('/');
      folder = parts[parts.length - 1] || 'general';
    }

    // Use route path to determine folder
    if (req.originalUrl.includes('product')) folder = 'products';
    if (req.originalUrl.includes('categor')) folder = 'categories';
    if (req.originalUrl.includes('banner')) folder = 'banners';
    if (req.originalUrl.includes('avatar')) folder = 'avatars';

    const destPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    cb(null, destPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const nameWithoutExt = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 30);

    const filename = `${nameWithoutExt}-${timestamp}-${uniqueId}${ext}`;
    cb(null, filename);
  },
});

// Memory storage (for when you want to process before saving)
const memoryStorage = multer.memoryStorage();

// File filter — only allow image types
const fileFilter = (req, file, cb) => {
  // Allowed mime types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/avif',
  ];

  // Allowed extensions
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|svg|avif)$/i;

  const isMimeValid = allowedMimeTypes.includes(file.mimetype);
  const isExtValid = allowedExtensions.test(path.extname(file.originalname));

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid file type "${file.originalname}". Only JPEG, JPG, PNG, GIF, WEBP, SVG, and AVIF images are allowed.`
    );
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Multer configuration with disk storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
    files: 10, // Maximum 10 files
    fieldSize: 10 * 1024 * 1024, // 10MB field size
  },
  fileFilter: fileFilter,
});

// Multer configuration with memory storage
const uploadMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: fileFilter,
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum file size is 5MB.',
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files allowed.',
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: `Unexpected field name "${err.field}". Please use the correct field name.`,
        });
      case 'LIMIT_FIELD_KEY':
        return res.status(400).json({
          success: false,
          message: 'Field name too long.',
        });
      case 'LIMIT_FIELD_VALUE':
        return res.status(400).json({
          success: false,
          message: 'Field value too long.',
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many fields.',
        });
      case 'LIMIT_PART_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many parts in the request.',
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
    }
  }

  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

// Helper: clean up uploaded files (for use in error scenarios)
const cleanupFiles = (files) => {
  if (!files) return;

  const fileList = Array.isArray(files) ? files : [files];
  fileList.forEach((file) => {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Cleanup error:', err);
      });
    }
  });
};

module.exports = {
  upload,
  uploadMemory,
  handleMulterError,
  cleanupFiles,
};