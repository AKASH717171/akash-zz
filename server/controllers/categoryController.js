const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('slugify');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    const { active, parent, sort, withProductCount } = req.query;

    const filter = {};

    // Filter by active status
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    // Filter by parent (top-level if parent=null)
    if (parent === 'null' || parent === 'none') {
      filter.parent = null;
    } else if (parent) {
      filter.parent = parent;
    }

    // Sort options
    let sortOption = { order: 1, createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === '-name') sortOption = { name: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    let query = Category.find(filter)
      .populate('children', 'name slug image isActive order')
      .populate('parent', 'name slug')
      .sort(sortOption);

    // Optionally include product count
    if (withProductCount === 'true') {
      query = query.populate('productCount');
    }

    const categories = await query.lean({ virtuals: true });

    // If product count requested, manually count for each category
    let categoriesWithCount = categories;
    if (withProductCount === 'true') {
      categoriesWithCount = await Promise.all(
        categories.map(async (cat) => {
          const productCount = await Product.countDocuments({
            category: cat._id,
            status: 'active',
          });
          return { ...cat, productCount };
        })
      );
    }

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories.',
    });
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug })
      .populate('parent', 'name slug')
      .populate('children', 'name slug image isActive order');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // Get product count for this category
    const productCount = await Product.countDocuments({
      category: category._id,
      status: 'active',
    });

    // Get price range for products in this category
    const priceStats = await Product.aggregate([
      {
        $match: {
          category: category._id,
          status: 'active',
        },
      },
      {
        $group: {
          _id: null,
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
        },
      },
    ]);

    // Get available sizes and colors for filters
    const filterOptions = await Product.aggregate([
      {
        $match: {
          category: category._id,
          status: 'active',
        },
      },
      {
        $group: {
          _id: null,
          sizes: { $addToSet: '$sizes.name' },
          colors: { $addToSet: '$colors.name' },
          subCategories: { $addToSet: '$subCategory' },
        },
      },
    ]);

    const categoryData = category.toObject();
    categoryData.productCount = productCount;
    categoryData.priceRange = priceStats.length > 0
      ? { min: priceStats[0].minPrice || 0, max: priceStats[0].maxPrice || 0 }
      : { min: 0, max: 0 };

    if (filterOptions.length > 0) {
      categoryData.availableSizes = [...new Set(filterOptions[0].sizes.flat())].filter(Boolean).sort();
      categoryData.availableColors = [...new Set(filterOptions[0].colors.flat())].filter(Boolean).sort();
      categoryData.availableSubCategories = filterOptions[0].subCategories.filter(Boolean).sort();
    } else {
      categoryData.availableSizes = [];
      categoryData.availableColors = [];
      categoryData.availableSubCategories = [];
    }

    res.status(200).json({
      success: true,
      category: categoryData,
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category.',
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/id/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug')
      .populate('children', 'name slug image isActive order');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category.',
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      parent,
      subCategories,
      order,
      isActive,
      metaTitle,
      metaDescription,
    } = req.body;

    // Validate name
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Category name must be at least 2 characters.',
      });
    }

    // Check duplicate name
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists.',
      });
    }

    // Validate parent if provided
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found.',
        });
      }
    }

    // Process sub-categories
    let processedSubCategories = [];
    if (subCategories && Array.isArray(subCategories)) {
      processedSubCategories = subCategories
        .filter((sub) => sub.name && sub.name.trim())
        .map((sub) => ({
          name: sub.name.trim(),
          slug: slugify(sub.name.trim(), { lower: true, strict: true }),
        }));
    }

    const categoryData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      image: image || { url: '', publicId: '' },
      parent: parent || null,
      subCategories: processedSubCategories,
      order: order !== undefined ? parseInt(order) : 0,
      isActive: isActive !== undefined ? isActive : true,
      metaTitle: metaTitle ? metaTitle.trim() : '',
      metaDescription: metaDescription ? metaDescription.trim() : '',
    };

    const category = await Category.create(categoryData);

    const populatedCategory = await Category.findById(category._id)
      .populate('parent', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      category: populatedCategory,
    });
  } catch (error) {
    console.error('Create category error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name or slug already exists.',
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
      message: 'Failed to create category.',
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      image,
      parent,
      subCategories,
      order,
      isActive,
      metaTitle,
      metaDescription,
    } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // Check duplicate name (excluding current)
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'A category with this name already exists.',
        });
      }
    }

    // Prevent self-referencing parent
    if (parent && parent.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'A category cannot be its own parent.',
      });
    }

    // Validate parent if provided
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found.',
        });
      }
    }

    // Update fields
    if (name !== undefined) {
      category.name = name.trim();
      category.slug = slugify(name.trim(), { lower: true, strict: true });
    }
    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = image;
    if (parent !== undefined) category.parent = parent || null;
    if (order !== undefined) category.order = parseInt(order);
    if (isActive !== undefined) category.isActive = isActive;
    if (metaTitle !== undefined) category.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) category.metaDescription = metaDescription.trim();

    // Process sub-categories
    if (subCategories !== undefined && Array.isArray(subCategories)) {
      category.subCategories = subCategories
        .filter((sub) => sub.name && sub.name.trim())
        .map((sub) => ({
          name: sub.name.trim(),
          slug: sub.slug || slugify(sub.name.trim(), { lower: true, strict: true }),
        }));
    }

    await category.save();

    const updatedCategory = await Category.findById(id)
      .populate('parent', 'name slug')
      .populate('children', 'name slug image isActive order');

    res.status(200).json({
      success: true,
      message: 'Category updated successfully!',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID.',
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name or slug already exists.',
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
      message: 'Failed to update category.',
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // Check if products exist in this category
    const productCount = await Product.countDocuments({ category: id });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this category. It contains ${productCount} product(s). Please reassign or delete the products first.`,
        productCount,
      });
    }

    // Check if child categories exist
    const childCount = await Category.countDocuments({ parent: id });

    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this category. It has ${childCount} sub-category(ies). Please delete or reassign them first.`,
        childCount,
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully!',
    });
  } catch (error) {
    console.error('Delete category error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete category.',
    });
  }
};

// @desc    Get categories for admin (with product counts)
// @route   GET /api/categories/admin/all
// @access  Private/Admin
const getAdminCategories = async (req, res) => {
  try {
    const { search, active, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (active !== undefined && active !== '') {
      filter.isActive = active === 'true';
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalCategories = await Category.countDocuments(filter);

    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id });
        return { ...cat, productCount };
      })
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCounts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCategories / limitNum),
        totalItems: totalCategories,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCategories / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get admin categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories.',
    });
  }
};

// @desc    Reorder categories
// @route   PUT /api/categories/reorder
// @access  Private/Admin
const reorderCategories = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of category orders.',
      });
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await Category.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Categories reordered successfully!',
    });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder categories.',
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminCategories,
  reorderCategories,
};