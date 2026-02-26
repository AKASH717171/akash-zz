const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'title slug images regularPrice salePrice stock sizes status',
      });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
      return res.status(200).json({
        success: true,
        cart: {
          _id: cart._id,
          items: [],
          totalItems: 0,
          subtotal: 0,
          totalSavings: 0,
        },
      });
    }

    // Validate each cart item against current product data
    let modified = false;
    const validItems = [];
    const removedItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        removedItems.push({ title: item.title, reason: 'Product no longer exists' });
        modified = true;
        continue;
      }

      const product = item.product;

      if (product.status !== 'active') {
        removedItems.push({ title: item.title, reason: 'Product is no longer available' });
        modified = true;
        continue;
      }

      // Update price if changed
      const currentPrice = (product.salePrice && product.salePrice < product.regularPrice)
        ? product.salePrice
        : product.regularPrice;

      if (item.price !== currentPrice || item.regularPrice !== product.regularPrice) {
        item.price = currentPrice;
        item.regularPrice = product.regularPrice;
        modified = true;
      }

      // Check stock
      let availableStock = product.stock;
      if (item.size && product.sizes && product.sizes.length > 0) {
        const sizeObj = product.sizes.find(
          (s) => s.name.toLowerCase() === item.size.toLowerCase()
        );
        availableStock = sizeObj ? sizeObj.stock : 0;
      }

      if (availableStock <= 0) {
        removedItems.push({ title: item.title, reason: 'Out of stock' });
        modified = true;
        continue;
      }

      if (item.quantity > availableStock) {
        item.quantity = availableStock;
        modified = true;
      }

      validItems.push(item);
    }

    if (modified) {
      cart.items = validItems;
      await cart.save();
    }

    // Re-fetch with populated data
    cart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'title slug images regularPrice salePrice stock sizes status',
      })
      .lean({ virtuals: true });

    // Calculate totals
    let totalItems = 0;
    let subtotal = 0;
    let totalSavings = 0;

    if (cart.items) {
      cart.items.forEach((item) => {
        totalItems += item.quantity;
        subtotal += item.price * item.quantity;
        const saving = (item.regularPrice - item.price) * item.quantity;
        if (saving > 0) totalSavings += saving;
      });
    }

    res.status(200).json({
      success: true,
      cart: {
        ...cart,
        totalItems,
        subtotal,
        totalSavings,
      },
      removedItems: removedItems.length > 0 ? removedItems : undefined,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart.',
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This product is not available for purchase.',
      });
    }

    // Check stock
    const qty = Math.max(1, parseInt(quantity));
    let availableStock = product.stock;

    if (size && product.sizes && product.sizes.length > 0) {
      const sizeObj = product.sizes.find(
        (s) => s.name.toLowerCase() === size.toLowerCase()
      );
      if (!sizeObj) {
        return res.status(400).json({
          success: false,
          message: `Size "${size}" is not available for this product.`,
        });
      }
      availableStock = sizeObj.stock;
    }

    if (availableStock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This product is out of stock.',
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (item.size || '').toLowerCase() === (size || '').toLowerCase() &&
        (item.color || '').toLowerCase() === (color || '').toLowerCase()
    );

    const price = (product.salePrice && product.salePrice < product.regularPrice)
      ? product.salePrice
      : product.regularPrice;

    const mainImage = product.images.find((img) => img.isMain) || product.images[0];

    if (existingIndex > -1) {
      // Update existing item quantity
      const newQty = cart.items[existingIndex].quantity + qty;

      if (newQty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableStock} item(s) available. You already have ${cart.items[existingIndex].quantity} in cart.`,
        });
      }

      if (newQty > 20) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 20 items per product allowed.',
        });
      }

      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = price;
      cart.items[existingIndex].regularPrice = product.regularPrice;
    } else {
      if (qty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableStock} item(s) available.`,
        });
      }

      cart.items.push({
        product: productId,
        title: product.title,
        image: mainImage ? mainImage.url : '',
        size: size || '',
        color: color || '',
        price,
        regularPrice: product.regularPrice,
        quantity: qty,
      });
    }

    await cart.save();

    // Fetch populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'title slug images regularPrice salePrice stock sizes status',
      })
      .lean({ virtuals: true });

    let totalItems = 0;
    let subtotal = 0;
    populatedCart.items.forEach((item) => {
      totalItems += item.quantity;
      subtotal += item.price * item.quantity;
    });

    res.status(200).json({
      success: true,
      message: existingIndex > -1 ? 'Cart updated!' : 'Added to cart!',
      cart: { ...populatedCart, totalItems, subtotal },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart.',
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.',
      });
    }

    if (quantity > 20) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 20 items per product allowed.',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.',
      });
    }

    // Check stock
    const product = await Product.findById(cart.items[itemIndex].product);

    if (!product || product.status !== 'active') {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(400).json({
        success: false,
        message: 'Product is no longer available. It has been removed from your cart.',
      });
    }

    let availableStock = product.stock;
    const itemSize = cart.items[itemIndex].size;

    if (itemSize && product.sizes && product.sizes.length > 0) {
      const sizeObj = product.sizes.find(
        (s) => s.name.toLowerCase() === itemSize.toLowerCase()
      );
      availableStock = sizeObj ? sizeObj.stock : 0;
    }

    if (quantity > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} item(s) available.`,
      });
    }

    // Update price in case it changed
    const currentPrice = (product.salePrice && product.salePrice < product.regularPrice)
      ? product.salePrice
      : product.regularPrice;

    cart.items[itemIndex].quantity = parseInt(quantity);
    cart.items[itemIndex].price = currentPrice;
    cart.items[itemIndex].regularPrice = product.regularPrice;

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'title slug images regularPrice salePrice stock sizes status',
      })
      .lean({ virtuals: true });

    let totalItems = 0;
    let subtotal = 0;
    populatedCart.items.forEach((item) => {
      totalItems += item.quantity;
      subtotal += item.price * item.quantity;
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated!',
      cart: { ...populatedCart, totalItems, subtotal },
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart.',
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.',
      });
    }

    const removedItem = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'title slug images regularPrice salePrice stock sizes status',
      })
      .lean({ virtuals: true });

    let totalItems = 0;
    let subtotal = 0;
    populatedCart.items.forEach((item) => {
      totalItems += item.quantity;
      subtotal += item.price * item.quantity;
    });

    res.status(200).json({
      success: true,
      message: `"${removedItem.title}" removed from cart.`,
      cart: { ...populatedCart, totalItems, subtotal },
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart.',
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Cart is already empty.',
        cart: { items: [], totalItems: 0, subtotal: 0 },
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      cart: { _id: cart._id, items: [], totalItems: 0, subtotal: 0, totalSavings: 0 },
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart.',
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};