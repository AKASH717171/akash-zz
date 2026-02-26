const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const slugify = require('slugify');
const mongoose = require('mongoose');

// @desc    Get all products (public — with filtering, search, sorting, pagination)
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      subCategory,
      minPrice,
      maxPrice,
      size,
      color,
      sort,
      page = 1,
      limit = 12,
      featured,
      newArrival,
      bestSeller,
      sale,
      tag,
      status,
    } = req.query;

    const filter = {};

    // Only show active products publicly
    filter.status = 'active';

    // ---- TEXT SEARCH ----
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // ---- CATEGORY FILTER ----
    if (category) {
      // Support category slug or ID
      let categoryId = category;

      if (!mongoose.Types.ObjectId.isValid(category)) {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          categoryId = categoryDoc._id;
        } else {
          return res.status(200).json({
            success: true,
            products: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: parseInt(limit),
              hasNextPage: false,
              hasPrevPage: false,
            },
          });
        }
      }

      filter.category = categoryId;
    }

    // ---- SUB-CATEGORY FILTER ----
    if (subCategory) {
      filter.subCategory = { $regex: new RegExp(`^${subCategory}$`, 'i') };
    }

    // ---- PRICE RANGE ----
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);

      // Use effective price (salePrice if exists, otherwise regularPrice)
      filter.$or = filter.$or || [];
      const priceConditions = [];

      if (minPrice && maxPrice) {
        priceConditions.push(
          {
            salePrice: { $ne: null, $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) },
          },
          {
            salePrice: null,
            regularPrice: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) },
          }
        );
      } else if (minPrice) {
        priceConditions.push(
          { salePrice: { $ne: null, $gte: parseFloat(minPrice) } },
          { salePrice: null, regularPrice: { $gte: parseFloat(minPrice) } }
        );
      } else if (maxPrice) {
        priceConditions.push(
          { salePrice: { $ne: null, $lte: parseFloat(maxPrice) } },
          { salePrice: null, regularPrice: { $lte: parseFloat(maxPrice) } }
        );
      }

      // If there's already an $or from search, we need $and
      if (filter.$or && filter.$or.length > 0 && priceConditions.length > 0) {
        const searchOr = filter.$or;
        delete filter.$or;
        filter.$and = [
          { $or: searchOr },
          { $or: priceConditions },
        ];
      } else if (priceConditions.length > 0) {
        filter.$or = priceConditions;
      }
    }

    // ---- SIZE FILTER ----
    if (size) {
      const sizes = size.split(',').map((s) => s.trim());
      filter['sizes.name'] = { $in: sizes };
    }

    // ---- COLOR FILTER ----
    if (color) {
      const colors = color.split(',').map((c) => c.trim());
      filter['colors.name'] = {
        $in: colors.map((c) => new RegExp(c, 'i')),
      };
    }

    // ---- FEATURED FILTER ----
    if (featured === 'true') {
      filter.featured = true;
    }

    // ---- NEW ARRIVAL FILTER ----
    if (newArrival === 'true') {
      filter.newArrival = true;
    }

    // ---- BEST SELLER FILTER ----
    if (bestSeller === 'true') {
      filter.bestSeller = true;
    }

    // ---- SALE FILTER ----
    if (sale === 'true') {
      filter.salePrice = { $ne: null, $gt: 0 };
    }

    // ---- TAG FILTER ----
    if (tag) {
      const tags = tag.split(',').map((t) => t.trim());
      filter.tags = { $in: tags.map((t) => new RegExp(t, 'i')) };
    }

    // ---- SORTING ----
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'price_low':
        sortOption = { regularPrice: 1 };
        break;
      case 'price_high':
        sortOption = { regularPrice: -1 };
        break;
      case 'name_asc':
        sortOption = { title: 1 };
        break;
      case 'name_desc':
        sortOption = { title: -1 };
        break;
      case 'popular':
        sortOption = { totalSold: -1 };
        break;
      case 'rating':
        sortOption = { 'ratings.average': -1 };
        break;
      case 'discount':
        sortOption = { discountPercent: -1 };
        break;
      default:
        sortOption = { featured: -1, createdAt: -1 };
    }

    // ---- PAGINATION ----
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // ---- EXECUTE QUERY ----
    const [products, totalItems] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .select('-description -careInstructions -metaTitle -metaDescription -dimensions -weight')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products.',
    });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug })
      .populate('category', 'name slug subCategories');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Increment view count
    product.views = (product.views || 0) + 1;
    await product.save({ validateBeforeSave: false });

    // Fetch approved reviews
    const reviews = await Review.find({
      product: product._id,
      status: 'approved',
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Review stats
    const reviewStats = await Review.aggregate([
      { $match: { product: product._id, status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const ratingDistribution = {};
    for (let i = 5; i >= 1; i--) {
      const found = reviewStats.find((r) => r._id === i);
      ratingDistribution[i] = found ? found.count : 0;
    }

    const productData = product.toObject({ virtuals: true });
    productData.reviews = reviews;
    productData.reviewStats = {
      distribution: ratingDistribution,
      totalReviews: reviews.length,
    };

    res.status(200).json({
      success: true,
      product: productData,
    });
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product.',
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/id/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug subCategories');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product.',
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/collection/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({
      featured: true,
      status: 'active',
    })
      .populate('category', 'name slug')
      .select('title slug images regularPrice salePrice discountPercent ratings category featured newArrival tags stock')
      .sort({ totalSold: -1, createdAt: -1 })
      .limit(limit)
      .lean({ virtuals: true });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products.',
    });
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/collection/new-arrivals
// @access  Public
const getNewArrivals = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({
      newArrival: true,
      status: 'active',
    })
      .populate('category', 'name slug')
      .select('title slug images regularPrice salePrice discountPercent ratings category featured newArrival tags stock')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean({ virtuals: true });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new arrivals.',
    });
  }
};

// @desc    Get best sellers
// @route   GET /api/products/collection/best-sellers
// @access  Public
const getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({
      bestSeller: true,
      status: 'active',
    })
      .populate('category', 'name slug')
      .select('title slug images regularPrice salePrice discountPercent ratings category featured newArrival bestSeller tags stock')
      .sort({ totalSold: -1 })
      .limit(limit)
      .lean({ virtuals: true });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get best sellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch best sellers.',
    });
  }
};

// @desc    Get sale products
// @route   GET /api/products/collection/sale
// @access  Public
const getSaleProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;

    const products = await Product.find({
      salePrice: { $ne: null, $gt: 0 },
      status: 'active',
    })
      .populate('category', 'name slug')
      .select('title slug images regularPrice salePrice discountPercent ratings category featured newArrival tags stock')
      .sort({ discountPercent: -1 })
      .limit(limit)
      .lean({ virtuals: true });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get sale products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sale products.',
    });
  }
};

// @desc    Get related products
// @route   GET /api/products/:slug/related
// @access  Public
const getRelatedProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit) || 4;

    // slug parameter হতে পারে actual slug অথবা MongoDB _id
    const isId = /^[a-f\d]{24}$/i.test(slug);
    const currentProduct = isId
      ? await Product.findById(slug).select('_id category subCategory tags')
      : await Product.findOne({ slug }).select('_id category subCategory tags');

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Find related products: same category, exclude current product
    let relatedProducts = await Product.find({
      category: currentProduct.category,
      _id: { $ne: currentProduct._id },
      status: 'active',
    })
      .populate('category', 'name slug')
      .select('title slug images regularPrice salePrice discountPercent ratings category featured newArrival tags stock')
      .sort({ totalSold: -1, 'ratings.average': -1 })
      .limit(limit)
      .lean({ virtuals: true });

    // If not enough related products from same category, fill from other categories with matching tags
    if (relatedProducts.length < limit && currentProduct.tags && currentProduct.tags.length > 0) {
      const existingIds = [currentProduct._id, ...relatedProducts.map((p) => p._id)];
      const remaining = limit - relatedProducts.length;

      const tagRelated = await Product.find({
        _id: { $nin: existingIds },
        status: 'active',
        tags: { $in: currentProduct.tags },
      })
        .populate('category', 'name slug')
        .select('title slug images regularPrice salePrice discountPercent ratings category featured newArrival tags stock')
        .sort({ totalSold: -1 })
        .limit(remaining)
        .lean({ virtuals: true });

      relatedProducts = [...relatedProducts, ...tagRelated];
    }

    res.status(200).json({
      success: true,
      count: relatedProducts.length,
      products: relatedProducts,
    });
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related products.',
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      descriptions,
      description: descDirect,
      category,
      subCategory,
      images,
      regularPrice,
      salePrice,
      sizes,
      colors,
      stock,
      sku,
      tags,
      featured,
      newArrival,
      bestSeller,
      status,
      materials,
      careInstructions,
      weight,
      dimensions,
      metaTitle,
      metaDescription,
    } = req.body;

    // Handle both formats: descriptions.long (frontend) OR description (direct)
    const description = (descriptions && descriptions.long) ? descriptions.long : (descDirect || '');
    const shortDesc = (descriptions && descriptions.short) ? descriptions.short : (shortDescription || '');

    // Validations
    const errors = [];

    if (!title || title.trim().length < 3) {
      errors.push('Product title must be at least 3 characters');
    }

    if (!description || description.trim().length < 10) {
      errors.push('Product description must be at least 10 characters');
    }

    if (!category) {
      errors.push('Product category is required');
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      errors.push('At least one product image is required');
    }

    if (regularPrice === undefined || regularPrice === null || parseFloat(regularPrice) <= 0) {
      errors.push('Regular price must be greater than 0');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    // Validate category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Selected category does not exist.',
      });
    }

    // Check duplicate SKU
    if (sku) {
      const existingSku = await Product.findOne({ sku: sku.toUpperCase().trim() });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: `SKU "${sku}" is already in use.`,
        });
      }
    }

    // Generate unique slug
    let slug = slugify(title.trim(), { lower: true, strict: true });
    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Process images — ensure at least one is marked as main
    let processedImages = images.map((img, index) => ({
      url: img.url,
      publicId: img.publicId || '',
      alt: img.alt || title.trim(),
      isMain: img.isMain || false,
    }));

    const hasMain = processedImages.some((img) => img.isMain);
    if (!hasMain && processedImages.length > 0) {
      processedImages[0].isMain = true;
    }

    // Process sizes
    let processedSizes = [];
    if (sizes && Array.isArray(sizes)) {
      processedSizes = sizes
        .filter((s) => s.name && s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          stock: parseInt(s.stock) || 0,
        }));
    }

    // Process colors
    let processedColors = [];
    if (colors && Array.isArray(colors)) {
      processedColors = colors
        .filter((c) => c.name && c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          code: c.code || '',
        }));
    }

    // Process tags
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        processedTags = tags.map((t) => t.trim()).filter(Boolean);
      }
    }

    // Calculate total stock from sizes if sizes exist
    let totalStock = parseInt(stock) || 0;
    if (processedSizes.length > 0) {
      totalStock = processedSizes.reduce((sum, s) => sum + s.stock, 0);
    }

    const productData = {
      title: title.trim(),
      slug,
      shortDescription: shortDesc ? shortDesc.trim() : '',
      description: description.trim(),
      category,
      subCategory: subCategory ? subCategory.trim() : '',
      images: processedImages,
      regularPrice: parseFloat(regularPrice),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      sizes: processedSizes,
      colors: processedColors,
      stock: totalStock,
      sku: sku ? sku.toUpperCase().trim() : `LF-${Date.now().toString(36).toUpperCase()}`,
      tags: processedTags,
      featured: featured === true || featured === 'true',
      newArrival: newArrival === true || newArrival === 'true',
      bestSeller: bestSeller === true || bestSeller === 'true',
      status: status || 'active',
      materials: materials ? materials.trim() : '',
      careInstructions: careInstructions ? careInstructions.trim() : '',
      weight: weight ? parseFloat(weight) : 0,
      dimensions: dimensions || { length: 0, width: 0, height: 0 },
      metaTitle: metaTitle ? metaTitle.trim() : title.trim(),
      metaDescription: metaDescription ? metaDescription.trim() : (shortDesc || '').trim(),
    };

    const product = await Product.create(productData);

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: populatedProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate value for ${field}. Please use a different value.`,
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product.',
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const {
      title,
      shortDescription,
      description,
      category,
      subCategory,
      images,
      regularPrice,
      salePrice,
      sizes,
      colors,
      stock,
      sku,
      tags,
      featured,
      newArrival,
      bestSeller,
      status,
      materials,
      careInstructions,
      weight,
      dimensions,
      metaTitle,
      metaDescription,
    } = req.body;

    // Update title and slug
    if (title !== undefined) {
      product.title = title.trim();
      if (title.trim() !== product.title) {
        let newSlug = slugify(title.trim(), { lower: true, strict: true });
        const existingSlug = await Product.findOne({
          slug: newSlug,
          _id: { $ne: id },
        });
        if (existingSlug) {
          newSlug = `${newSlug}-${Date.now().toString(36)}`;
        }
        product.slug = newSlug;
      }
    }

    if (shortDescription !== undefined) product.shortDescription = shortDescription.trim();
    if (description !== undefined) product.description = description.trim();

    // Category
    if (category !== undefined) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Selected category does not exist.',
        });
      }
      product.category = category;
    }

    if (subCategory !== undefined) product.subCategory = subCategory.trim();

    // Images
    if (images !== undefined && Array.isArray(images) && images.length > 0) {
      product.images = images.map((img, index) => ({
        url: img.url,
        publicId: img.publicId || '',
        alt: img.alt || product.title,
        isMain: img.isMain || false,
      }));

      const hasMain = product.images.some((img) => img.isMain);
      if (!hasMain) product.images[0].isMain = true;
    }

    // Prices
    if (regularPrice !== undefined) product.regularPrice = parseFloat(regularPrice);
    if (salePrice !== undefined) {
      product.salePrice = salePrice === null || salePrice === '' || salePrice === 0
        ? null
        : parseFloat(salePrice);
    }

    // Sizes
    if (sizes !== undefined && Array.isArray(sizes)) {
      product.sizes = sizes
        .filter((s) => s.name && s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          stock: parseInt(s.stock) || 0,
        }));
    }

    // Colors
    if (colors !== undefined && Array.isArray(colors)) {
      product.colors = colors
        .filter((c) => c.name && c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          code: c.code || '',
        }));
    }

    // Stock
    if (stock !== undefined) {
      product.stock = parseInt(stock);
    } else if (sizes !== undefined && Array.isArray(sizes)) {
      product.stock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
    }

    // SKU
    if (sku !== undefined) {
      if (sku && sku.toUpperCase().trim() !== product.sku) {
        const existingSku = await Product.findOne({
          sku: sku.toUpperCase().trim(),
          _id: { $ne: id },
        });
        if (existingSku) {
          return res.status(400).json({
            success: false,
            message: `SKU "${sku}" is already in use.`,
          });
        }
        product.sku = sku.toUpperCase().trim();
      }
    }

    // Tags
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        product.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        product.tags = tags.map((t) => t.trim()).filter(Boolean);
      }
    }

    // Boolean flags
    if (featured !== undefined) product.featured = featured === true || featured === 'true';
    if (newArrival !== undefined) product.newArrival = newArrival === true || newArrival === 'true';
    if (bestSeller !== undefined) product.bestSeller = bestSeller === true || bestSeller === 'true';
    if (status !== undefined) product.status = status;

    // Additional fields
    if (materials !== undefined) product.materials = materials.trim();
    if (careInstructions !== undefined) product.careInstructions = careInstructions.trim();
    if (weight !== undefined) product.weight = parseFloat(weight) || 0;
    if (dimensions !== undefined) product.dimensions = dimensions;
    if (metaTitle !== undefined) product.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) product.metaDescription = metaDescription.trim();

    await product.save();

    const updatedProduct = await Product.findById(id)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate value for ${field}.`,
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product.',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Delete associated reviews
    await Review.deleteMany({ product: id });

    // Delete the product
    await Product.findByIdAndDelete(id);

    // TODO: Delete images from Cloudinary
    // const { deleteFromCloudinary } = require('../config/cloudinary');
    // for (const img of product.images) {
    //   if (img.publicId) await deleteFromCloudinary(img.publicId);
    // }

    res.status(200).json({
      success: true,
      message: 'Product and associated reviews deleted successfully!',
    });
  } catch (error) {
    console.error('Delete product error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete product.',
    });
  }
};

// @desc    Get all products for admin (with full details)
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAdminProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      featured,
      newArrival,
      bestSeller,
      stockStatus,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) filter.category = categoryDoc._id;
      }
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Featured filter
    if (featured === 'true') filter.featured = true;
    if (featured === 'false') filter.featured = false;

    // New arrival filter
    if (newArrival === 'true') filter.newArrival = true;
    if (newArrival === 'false') filter.newArrival = false;

    // Best seller filter
    if (bestSeller === 'true') filter.bestSeller = true;

    // Stock status filter
    if (stockStatus === 'in_stock') {
      filter.stock = { $gt: 0 };
    } else if (stockStatus === 'out_of_stock') {
      filter.stock = { $lte: 0 };
    } else if (stockStatus === 'low_stock') {
      filter.stock = { $gt: 0, $lte: 10 };
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    switch (sort) {
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'price_low': sortOption = { regularPrice: 1 }; break;
      case 'price_high': sortOption = { regularPrice: -1 }; break;
      case 'name_asc': sortOption = { title: 1 }; break;
      case 'name_desc': sortOption = { title: -1 }; break;
      case 'stock_low': sortOption = { stock: 1 }; break;
      case 'stock_high': sortOption = { stock: -1 }; break;
      case 'most_sold': sortOption = { totalSold: -1 }; break;
      case 'most_viewed': sortOption = { views: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalItems] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .select('-description -careInstructions -metaDescription')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    // Get overall stats
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] },
          },
          lowStockProducts: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] },
                1,
                0,
              ],
            },
          },
          featuredProducts: {
            $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] },
          },
        },
      },
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
      stats: stats.length > 0 ? stats[0] : {},
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products.',
    });
  }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, sizes, action } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Update sizes stock
    if (sizes && Array.isArray(sizes)) {
      product.sizes = sizes.map((s) => ({
        name: s.name.trim(),
        stock: Math.max(0, parseInt(s.stock) || 0),
      }));
      product.stock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
    } else if (stock !== undefined) {
      if (action === 'increment') {
        product.stock = Math.max(0, product.stock + parseInt(stock));
      } else if (action === 'decrement') {
        product.stock = Math.max(0, product.stock - parseInt(stock));
      } else {
        product.stock = Math.max(0, parseInt(stock));
      }
    }

    // Auto update status based on stock
    if (product.stock <= 0 && product.status === 'active') {
      product.status = 'out_of_stock';
    } else if (product.stock > 0 && product.status === 'out_of_stock') {
      product.status = 'active';
    }

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully!',
      product: {
        _id: product._id,
        title: product.title,
        stock: product.stock,
        sizes: product.sizes,
        status: product.status,
      },
    });
  } catch (error) {
    console.error('Update stock error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update stock.',
    });
  }
};

// @desc    Bulk update product status
// @route   PUT /api/products/bulk/status
// @access  Private/Admin
const bulkUpdateStatus = async (req, res) => {
  try {
    const { productIds, status } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product IDs.',
      });
    }

    const validStatuses = ['active', 'inactive', 'draft', 'out_of_stock'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { status } }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} product(s) updated to "${status}".`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Bulk update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update products.',
    });
  }
};

// @desc    Bulk delete products
// @route   DELETE /api/products/bulk/delete
// @access  Private/Admin
const bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product IDs.',
      });
    }

    // Delete associated reviews
    await Review.deleteMany({ product: { $in: productIds } });

    // Delete products
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} product(s) deleted successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete products.',
    });
  }
};

// @desc    Get filter options (for shop page sidebar)
// @route   GET /api/products/filters/options
// @access  Public
const getFilterOptions = async (req, res) => {
  try {
    const { category } = req.query;

    const matchFilter = { status: 'active' };

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        matchFilter.category = new mongoose.Types.ObjectId(category);
      } else {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          matchFilter.category = categoryDoc._id;
        }
      }
    }

    const [filterData] = await Product.aggregate([
      { $match: matchFilter },
      { $unwind: { path: '$sizes', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$colors', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          sizes: { $addToSet: '$sizes.name' },
          colors: {
            $addToSet: {
              name: '$colors.name',
              code: '$colors.code',
            },
          },
          subCategories: { $addToSet: '$subCategory' },
          minPrice: {
            $min: {
              $cond: [
                { $and: [{ $ne: ['$salePrice', null] }, { $gt: ['$salePrice', 0] }] },
                '$salePrice',
                '$regularPrice',
              ],
            },
          },
          maxPrice: { $max: '$regularPrice' },
          tags: { $addToSet: '$tags' },
        },
      },
    ]);

    // Get categories with counts
    const categories = await Category.find({ isActive: true })
      .select('name slug image order')
      .sort({ order: 1 })
      .lean();

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          category: cat._id,
          status: 'active',
        });
        return { ...cat, productCount: count };
      })
    );

    const result = {
      categories: categoriesWithCount,
      sizes: filterData ? filterData.sizes.filter(Boolean).sort() : [],
      colors: filterData
        ? filterData.colors
            .filter((c) => c.name)
            .reduce((unique, color) => {
              if (!unique.find((c) => c.name === color.name)) {
                unique.push(color);
              }
              return unique;
            }, [])
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
      subCategories: filterData
        ? filterData.subCategories.filter(Boolean).sort()
        : [],
      priceRange: filterData
        ? { min: Math.floor(filterData.minPrice || 0), max: Math.ceil(filterData.maxPrice || 0) }
        : { min: 0, max: 0 },
      tags: filterData
        ? [...new Set(filterData.tags.flat())].filter(Boolean).sort()
        : [],
    };

    res.status(200).json({
      success: true,
      filters: result,
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options.',
    });
  }
};

module.exports = {
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
};