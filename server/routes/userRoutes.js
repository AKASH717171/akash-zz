const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc  Get all customers (admin)
// @route GET /api/users/admin/customers
router.get('/admin/customers', protect, isAdmin, async (req, res) => {
  try {
    const { search = '', sort = '-createdAt', page = 1, limit = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // totalOrders is computed from orders, so we can't sort by it at DB level
    // We'll sort by it in memory after fetching stats
    const sortByTotalOrders = sort === '-totalOrders' || sort === 'totalOrders';
    const dbSort = sortByTotalOrders ? '-createdAt' : sort;

    const filter = { role: 'user' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(dbSort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('name email phone createdAt isActive wishlist')
        .lean(),
      User.countDocuments(filter),
    ]);

    // Get order stats per user
    const userIds = users.map((u) => u._id);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                {
                  $not: [
                    { $in: ['$orderStatus', ['cancelled', 'refunded']] },
                  ],
                },
                '$total',
                0,
              ],
            },
          },
        },
      },
    ]);

    const statsMap = {};
    orderStats.forEach((s) => { statsMap[s._id.toString()] = s; });

    const customers = users.map((u) => ({
      ...u,
      totalOrders: statsMap[u._id.toString()]?.totalOrders || 0,
      totalSpent: statsMap[u._id.toString()]?.totalSpent || 0,
    }));

    // Sort by totalOrders in memory if requested
    if (sortByTotalOrders) {
      customers.sort((a, b) =>
        sort === '-totalOrders'
          ? b.totalOrders - a.totalOrders
          : a.totalOrders - b.totalOrders
      );
    }

    res.json({
      success: true,
      customers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customers.' });
  }
});

// @desc  Get single customer details (admin)
// @route GET /api/users/admin/customers/:id
router.get('/admin/customers/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('wishlist', 'title slug images regularPrice salePrice')
      .lean();

    if (!user) return res.status(404).json({ success: false, message: 'Customer not found.' });

    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber total orderStatus paymentStatus createdAt items')
      .lean();

    const spent = orders
      .filter((o) => !['cancelled', 'refunded'].includes(o.orderStatus))
      .reduce((sum, o) => sum + o.total, 0);

    res.json({ success: true, customer: { ...user, recentOrders: orders, totalSpent: spent } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer.' });
  }
});

// @desc  Toggle customer active status (admin)
// @route PUT /api/users/admin/customers/:id/toggle
router.put('/admin/customers/:id/toggle', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Customer not found.' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: `Customer ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update customer.' });
  }
});

module.exports = router;