const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private/Admin
const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please select an image to upload.',
      });
    }

    const folder = req.body.folder || 'luxe-fashion/general';

    let imageData;

    // Check if Cloudinary is configured
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      // Upload to Cloudinary
      imageData = await uploadToCloudinary(req.file.path, folder);

      // Remove local file after successful Cloudinary upload
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete local file:', err);
      });
    } else {
      // Local storage fallback
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      imageData = {
        url: fileUrl,
        publicId: req.file.filename,
      };
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully!',
      image: imageData,
    });
  } catch (error) {
    console.error('Upload single error:', error);

    // Clean up the uploaded file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to cleanup file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload image. Please try again.',
    });
  }
};

// @desc    Upload multiple images (max 6)
// @route   POST /api/upload/multiple
// @access  Private/Admin
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided. Please select images to upload.',
      });
    }

    if (req.files.length > 6) {
      // Clean up all files
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Failed to cleanup file:', err);
        });
      });

      return res.status(400).json({
        success: false,
        message: 'Maximum 6 images can be uploaded at once.',
      });
    }

    const folder = req.body.folder || 'luxe-fashion/products';
    const uploadedImages = [];
    const failedUploads = [];

    const useCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      try {
        let imageData;

        if (useCloudinary) {
          imageData = await uploadToCloudinary(file.path, folder);

          // Remove local file
          fs.unlink(file.path, (err) => {
            if (err) console.error('Failed to delete local file:', err);
          });
        } else {
          const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
          imageData = {
            url: fileUrl,
            publicId: file.filename,
          };
        }

        uploadedImages.push({
          ...imageData,
          alt: '',
          isMain: i === 0 && uploadedImages.length === 0,
          originalName: file.originalname,
          size: file.size,
        });
      } catch (uploadError) {
        console.error(`Failed to upload file ${file.originalname}:`, uploadError);
        failedUploads.push({
          filename: file.originalname,
          error: uploadError.message,
        });

        // Clean up the failed file
        fs.unlink(file.path, (err) => {
          if (err) console.error('Failed to cleanup failed file:', err);
        });
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'All image uploads failed. Please try again.',
        failedUploads,
      });
    }

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully${
        failedUploads.length > 0 ? `, ${failedUploads.length} failed` : ''
      }!`,
      images: uploadedImages,
      failedUploads: failedUploads.length > 0 ? failedUploads : undefined,
    });
  } catch (error) {
    console.error('Upload multiple error:', error);

    // Clean up all files on error
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Failed to cleanup file:', err);
        });
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload images. Please try again.',
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/upload
// @access  Private/Admin
const deleteImage = async (req, res) => {
  try {
    const { publicId, url } = req.body;

    if (!publicId && !url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide publicId or url of the image to delete.',
      });
    }

    const useCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (publicId && useCloudinary) {
      // Delete from Cloudinary
      await deleteFromCloudinary(publicId);
    } else if (url) {
      // Delete local file
      const filename = url.split('/uploads/').pop();
      if (filename) {
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully!',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image.',
    });
  }
};

// @desc    Upload via URL (base64 or external URL)
// @route   POST /api/upload/url
// @access  Private/Admin
const uploadFromUrl = async (req, res) => {
  try {
    const { imageUrl, folder } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image URL.',
      });
    }

    const useCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (useCloudinary) {
      const cloudinary = require('cloudinary').v2;
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: folder || 'luxe-fashion/general',
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully!',
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } else {
      // Just return the URL as-is for local development
      res.status(200).json({
        success: true,
        message: 'Image URL saved.',
        image: {
          url: imageUrl,
          publicId: '',
        },
      });
    }
  } catch (error) {
    console.error('Upload from URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image from URL.',
    });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteImage,
  uploadFromUrl,
};