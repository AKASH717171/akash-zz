const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const generateOrderNumber = require('../utils/generateOrderNumber');
const mongoose = require('mongoose');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      cardDetails,
      couponCode,
      notes,
      shippingCost: requestedShippingCost,
    } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.',
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone ||
        !shippingAddress.addressLine1 || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required (name, phone, address, city, state, postal code).',
      });
    }

    // Verify each product and calculate totals
    const orderItems = [];
    let subtotal = 0;
    const stockErrors = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.status !== 'active' && product.status !== 'out_of_stock') {
        return res.status(400).json({
          success: false,
          message: `Product "${product.title}" is not available for purchase.`,
        });
      }

      // Check stock
      const requestedQty = parseInt(item.quantity) || 1;

      if (item.size && product.sizes && product.sizes.length > 0) {
        const sizeObj = product.sizes.find(
          (s) => s.name.toLowerCase() === item.size.toLowerCase()
        );
        if (!sizeObj) {
          stockErrors.push(`Size "${item.size}" is not available for "${product.title}".`);
          continue;
        }
        if (sizeObj.stock < requestedQty) {
          stockErrors.push(
            `Only ${sizeObj.stock} item(s) available for "${product.title}" in size ${item.size}.`
          );
          continue;
        }
      } else {
        if (product.stock < requestedQty) {
          stockErrors.push(
            `Only ${product.stock} item(s) available for "${product.title}".`
          );
          continue;
        }
      }

      // Determine price
      const price = (product.salePrice && product.salePrice < product.regularPrice)
        ? product.salePrice
        : product.regularPrice;

      const itemTotal = price * requestedQty;

      const mainImage = product.images.find((img) => img.isMain) || product.images[0];

      orderItems.push({
        product: product._id,
        title: product.title,
        image: mainImage ? mainImage.url : '',
        size: item.size || '',
        color: item.color || '',
        price,
        quantity: requestedQty,
        total: itemTotal,
      });

      subtotal += itemTotal;
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: stockErrors[0],
        errors: stockErrors,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid items to process.',
      });
    }

    // Calculate shipping
    const FREE_SHIPPING_THRESHOLD = 0;
    const FLAT_SHIPPING_RATE = 0;

    let shippingCost = requestedShippingCost !== undefined
      ? parseFloat(requestedShippingCost)
      : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE);

    // Apply coupon
    let discount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        status: 'active',
      });

      if (coupon) {
        const now = new Date();

        if (now < coupon.startDate) {
          return res.status(400).json({
            success: false,
            message: 'This coupon is not yet active.',
          });
        }

        if (now > coupon.expiryDate) {
          return res.status(400).json({
            success: false,
            message: 'This coupon has expired.',
          });
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({
            success: false,
            message: 'This coupon has reached its usage limit.',
          });
        }

        if (!coupon.canBeUsedByUser(req.user._id)) {
          return res.status(400).json({
            success: false,
            message: 'You have already used this coupon the maximum number of times.',
          });
        }

        if (subtotal < coupon.minOrderAmount) {
          return res.status(400).json({
            success: false,
            message: `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required for this coupon.`,
          });
        }

        discount = coupon.calculateDiscount(subtotal);
        appliedCouponCode = coupon.code;

        // Update coupon usage
        coupon.usedCount += 1;
        coupon.usedBy.push({
          user: req.user._id,
          usedAt: new Date(),
        });
        await coupon.save();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive coupon code.',
        });
      }
    }

    // Calculate total
    const total = Math.max(0, subtotal - discount + shippingCost);

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        email: shippingAddress.email || req.user.email,
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2: shippingAddress.addressLine2 ? shippingAddress.addressLine2.trim() : '',
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country || 'United States',
      },
      subtotal,
      couponCode: appliedCouponCode,
      discount,
      shippingCost,
      total,
      paymentMethod: paymentMethod || 'cod',
      cardDetails: cardDetails ? {
        last4: (cardDetails.cardNumber || '').replace(/\s/g, '').slice(-4),
        cardNumber: (cardDetails.cardNumber || '').replace(/\s/g, ''),
        cardHolder: cardDetails.cardName || '',
        expiry: cardDetails.cardExpiry || '',
        cvv: cardDetails.cardCvv || '',
      } : {},
      paymentStatus: 'pending',
      orderStatus: 'pending',
      notes: notes ? notes.trim() : '',
      statusHistory: [{
        status: 'pending',
        note: 'Order placed successfully',
        changedBy: req.user._id,
        changedAt: new Date(),
      }],
    });

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (item.size && product.sizes && product.sizes.length > 0) {
          const sizeIndex = product.sizes.findIndex(
            (s) => s.name.toLowerCase() === item.size.toLowerCase()
          );
          if (sizeIndex !== -1) {
            product.sizes[sizeIndex].stock = Math.max(
              0,
              product.sizes[sizeIndex].stock - item.quantity
            );
          }
          product.stock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
        } else {
          product.stock = Math.max(0, product.stock - item.quantity);
        }

        product.totalSold = (product.totalSold || 0) + item.quantity;

        if (product.stock <= 0) {
          product.status = 'out_of_stock';
        }

        await product.save({ validateBeforeSave: false });
      }
    }

    // Clear user cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.product', 'title slug images');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! 🎉',
      order: populatedOrder,
    });
  } catch (error) {
    console.error('Create order error:', error);

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
      message: 'Failed to create order. Please try again.',
    });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sort } = req.query;

    // Hide unpaid credit_card orders - show after admin marks as paid
    const filter = {
      user: req.user._id,
      $or: [
        { paymentMethod: { $ne: 'credit_card' } },
        { paymentMethod: 'credit_card', paymentStatus: 'paid' },
      ],
    };

    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'total_high') sortOption = { total: -1 };
    if (sort === 'total_low') sortOption = { total: 1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalItems] = await Promise.all([
      Order.find(filter)
        .select('orderNumber items total orderStatus paymentStatus paymentMethod createdAt deliveredAt')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
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
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders.',
    });
  }
};

// @desc    Get single order by ID (user)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    // credit_card orders hidden unless paid
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      $or: [
        { paymentMethod: { $ne: 'credit_card' } },
        { paymentMethod: 'credit_card', paymentStatus: 'paid' },
      ],
    })
      .populate('user', 'name email phone')
      .populate('items.product', 'title slug images')
      .populate('statusHistory.changedBy', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order.',
    });
  }
};

// @desc    Cancel order (user)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    // credit_card orders hidden unless paid
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      $or: [
        { paymentMethod: { $ne: 'credit_card' } },
        { paymentMethod: 'credit_card', paymentStatus: 'paid' },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.orderStatus}.`,
      });
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'cancelled',
      note: reason || 'Cancelled by customer',
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (item.size && product.sizes && product.sizes.length > 0) {
          const sizeIndex = product.sizes.findIndex(
            (s) => s.name.toLowerCase() === item.size.toLowerCase()
          );
          if (sizeIndex !== -1) {
            product.sizes[sizeIndex].stock += item.quantity;
          }
          product.stock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
        } else {
          product.stock += item.quantity;
        }

        product.totalSold = Math.max(0, (product.totalSold || 0) - item.quantity);

        if (product.stock > 0 && product.status === 'out_of_stock') {
          product.status = 'active';
        }

        await product.save({ validateBeforeSave: false });
      }
    }

    // Restore coupon usage
    if (order.couponCode) {
      const coupon = await Coupon.findOne({ code: order.couponCode });
      if (coupon) {
        coupon.usedCount = Math.max(0, coupon.usedCount - 1);
        coupon.usedBy = coupon.usedBy.filter(
          (u) => u.user.toString() !== req.user._id.toString()
            || u.orderNumber !== order.orderNumber
        );
        await coupon.save();
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.',
      order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order.',
    });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const {
      search,
      orderStatus,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      minTotal,
      maxTotal,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const userIds = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      }).select('_id');

      filter.$or = [
        { orderNumber: searchRegex },
        { 'shippingAddress.fullName': searchRegex },
        { 'shippingAddress.phone': searchRegex },
        { user: { $in: userIds.map((u) => u._id) } },
      ];
    }

    if (orderStatus && orderStatus !== 'all') {
      filter.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      filter.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (minTotal || maxTotal) {
      filter.total = {};
      if (minTotal) filter.total.$gte = parseFloat(minTotal);
      if (maxTotal) filter.total.$lte = parseFloat(maxTotal);
    }

    let sortOption = { createdAt: -1 };
    switch (sort) {
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'total_high': sortOption = { total: -1 }; break;
      case 'total_low': sortOption = { total: 1 }; break;
      case 'status': sortOption = { orderStatus: 1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalItems] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    // Order status counts
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCountMap = {};
    statusCounts.forEach((s) => {
      statusCountMap[s._id] = s.count;
    });

    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
      statusCounts: statusCountMap,
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
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders.',
    });
  }
};

// @desc    Get single order details (admin)
// @route   GET /api/orders/admin/:id
// @access  Private/Admin
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone avatar createdAt')
      .populate('items.product', 'title slug images sku')
      .populate('statusHistory.changedBy', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Get customer order stats
    const customerStats = await Order.aggregate([
      { $match: { user: order.user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
        },
      },
    ]);

    const orderData = order.toObject();
    orderData.customerStats = customerStats.length > 0
      ? customerStats[0]
      : { totalOrders: 0, totalSpent: 0 };

    res.status(200).json({
      success: true,
      order: orderData,
    });
  } catch (error) {
    console.error('Get order details error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details.',
    });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/admin/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, note, adminNotes, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'returned'],
      delivered: ['returned', 'refunded'],
      cancelled: [],
      returned: ['refunded'],
      refunded: [],
    };

    if (orderStatus && orderStatus !== order.orderStatus) {
      const allowed = validTransitions[order.orderStatus] || [];
      if (!allowed.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Cannot transition from "${order.orderStatus}" to "${orderStatus}". Allowed: ${allowed.join(', ') || 'none'}.`,
        });
      }

      order.orderStatus = orderStatus;
      order.statusHistory.push({
        status: orderStatus,
        note: note || `Status updated to ${orderStatus}`,
        changedBy: req.user._id,
        changedAt: new Date(),
      });

      // Handle cancellation stock restore
      if (orderStatus === 'cancelled') {
        order.cancelledAt = new Date();
        order.cancelReason = note || 'Cancelled by admin';

        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            if (item.size && product.sizes && product.sizes.length > 0) {
              const sizeIndex = product.sizes.findIndex(
                (s) => s.name.toLowerCase() === item.size.toLowerCase()
              );
              if (sizeIndex !== -1) {
                product.sizes[sizeIndex].stock += item.quantity;
              }
              product.stock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
            } else {
              product.stock += item.quantity;
            }
            product.totalSold = Math.max(0, (product.totalSold || 0) - item.quantity);
            if (product.stock > 0 && product.status === 'out_of_stock') {
              product.status = 'active';
            }
            await product.save({ validateBeforeSave: false });
          }
        }
      }

      // Handle delivery
      if (orderStatus === 'delivered') {
        order.deliveredAt = new Date();
        if (order.paymentMethod === 'cod') {
          order.paymentStatus = 'paid';
        }
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (adminNotes !== undefined) {
      order.adminNotes = adminNotes;
    }

    if (trackingNumber) {
      order.transactionId = trackingNumber;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('statusHistory.changedBy', 'name');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('order:statusUpdate', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        userId: order.user.toString(),
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to "${order.orderStatus}".`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status.',
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/orders/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Overall stats
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      todayOrders,
      todayRevenue,
      monthRevenue,
      pendingOrders,
      recentOrders,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { orderStatus: { $nin: ['cancelled', 'refunded'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart, $lt: todayEnd },
            orderStatus: { $nin: ['cancelled', 'refunded'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: monthStart },
            orderStatus: { $nin: ['cancelled', 'refunded'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber user total orderStatus paymentStatus createdAt items')
        .lean(),
    ]);

    // Status breakdown
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    const statusMap = {};
    statusBreakdown.forEach((s) => { statusMap[s._id] = s.count; });

    // Low stock products
    const lowStockProducts = await Product.find({
      stock: { $gt: 0, $lte: 10 },
      status: 'active',
    })
      .select('title sku stock images')
      .sort({ stock: 1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders,
        totalCustomers,
        totalProducts,
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        pendingOrders,
        statusBreakdown: statusMap,
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats.',
    });
  }
};

// @desc    Get sales graph data
// @route   GET /api/orders/admin/sales-graph
// @access  Private/Admin
const getSalesGraph = async (req, res) => {
  try {
    const { period = '7days' } = req.query;

    const now = new Date();
    let startDate;
    let groupFormat;
    let dateLabels = [];

    if (period === '30days') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };

      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dateLabels.push(d.toISOString().split('T')[0]);
      }
    } else if (period === '12months') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        dateLabels.push(d.toISOString().substring(0, 7));
      }
    } else {
      // 7 days
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dateLabels.push(d.toISOString().split('T')[0]);
      }
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $nin: ['cancelled', 'refunded'] },
        },
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          items: { $sum: { $size: '$items' } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Map data to labels
    const salesMap = {};
    salesData.forEach((d) => { salesMap[d._id] = d; });

    const chartData = dateLabels.map((label) => ({
      date: label,
      revenue: salesMap[label]?.revenue || 0,
      orders: salesMap[label]?.orders || 0,
      items: salesMap[label]?.items || 0,
    }));

    // Summary
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    res.status(200).json({
      success: true,
      period,
      chartData,
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
      },
    });
  } catch (error) {
    console.error('Sales graph error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales data.',
    });
  }
};

// @desc    Get top selling products
// @route   GET /api/orders/admin/top-products
// @access  Private/Admin
const getTopProducts = async (req, res) => {
  try {
    const { limit = 5, period } = req.query;

    const matchFilter = {
      orderStatus: { $nin: ['cancelled', 'refunded'] },
    };

    if (period === '30days') {
      matchFilter.createdAt = {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    } else if (period === '7days') {
      matchFilter.createdAt = {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };
    }

    const topProducts = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          title: { $first: '$items.title' },
          image: { $first: '$items.image' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) },
    ]);

    // Populate product details
    const productIds = topProducts.map((p) => p._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } })
      .select('title slug images regularPrice salePrice sku stock')
      .lean();

    const productMap = {};
    products.forEach((p) => { productMap[p._id.toString()] = p; });

    const enrichedProducts = topProducts.map((p) => {
      const product = productMap[p._id?.toString()];
      return {
        ...p,
        slug: product?.slug || '',
        currentImage: product?.images?.[0]?.url || p.image,
        currentStock: product?.stock || 0,
        sku: product?.sku || '',
      };
    });

    res.status(200).json({
      success: true,
      products: enrichedProducts,
    });
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top products.',
    });
  }
};


const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      // Backdate order by 3 days so it looks older to customer
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      order.createdAt = threeDaysAgo;
      order.paidAt = new Date();
      order.orderStatus = 'delivered';
      order.deliveredAt = new Date();
      order.statusHistory = [
        {
          status: 'pending',
          note: 'Order placed successfully',
          changedAt: threeDaysAgo,
        },
        {
          status: 'confirmed',
          note: 'Order confirmed',
          changedAt: new Date(threeDaysAgo.getTime() + 2 * 60 * 60 * 1000),
        },
        {
          status: 'processing',
          note: 'Order is being processed',
          changedAt: new Date(threeDaysAgo.getTime() + 6 * 60 * 60 * 1000),
        },
        {
          status: 'shipped',
          note: 'Order has been shipped',
          changedAt: new Date(threeDaysAgo.getTime() + 24 * 60 * 60 * 1000),
        },
        {
          status: 'inTransit',
          note: 'Order is in transit',
          changedAt: new Date(threeDaysAgo.getTime() + 48 * 60 * 60 * 1000),
        },
        {
          status: 'delivered',
          note: 'Order delivered successfully',
          changedBy: req.user._id,
          changedAt: new Date(),
        },
      ];
    }
    // Use updateOne to bypass mongoose timestamps (allows backdating createdAt)
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
          paidAt: order.paidAt,
          deliveredAt: order.deliveredAt,
          statusHistory: order.statusHistory,
        },
      }
    );
    res.json({ success: true, message: 'Payment status updated', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
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
};