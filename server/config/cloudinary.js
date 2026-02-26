const cloudinary = require('cloudinary').v2;

// Configure Cloudinary only if credentials exist
const isConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️  Cloudinary configured successfully');
} else {
  console.log('⚠️  Cloudinary not configured — using local file storage');
}

const uploadToCloudinary = async (filePath, folder = 'luxe-fashion') => {
  if (!isConfigured) {
    throw new Error('Cloudinary is not configured. Please set environment variables.');
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

const deleteFromCloudinary = async (publicId) => {
  if (!isConfigured) {
    console.log('Cloudinary not configured, skipping delete');
    return null;
  }

  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

const uploadMultipleToCloudinary = async (filePaths, folder = 'luxe-fashion') => {
  if (!isConfigured) {
    throw new Error('Cloudinary is not configured.');
  }

  const results = [];
  for (const filePath of filePaths) {
    try {
      const result = await uploadToCloudinary(filePath, folder);
      results.push(result);
    } catch (error) {
      results.push({ url: '', publicId: '', error: error.message });
    }
  }
  return results;
};

module.exports = {
  cloudinary,
  isConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
};