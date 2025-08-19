const Order = require('../models/Order');
const Product = require('../models/Product');

// ==========================
// Get user's orders
// ==========================
const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const filter = { userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.productId', 'title images')
        .lean(),
      Order.countDocuments(filter)
    ]);

    res.json({
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};

// ==========================
// Get order by ID
// ==========================
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const filter = { orderId };
    if (req.user.role !== 'ADMIN') filter.userId = userId;

    const order = await Order.findOne(filter)
      .populate('items.productId', 'title images sku')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
    }

    res.json({ message: 'Order retrieved successfully', data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to retrieve order' });
  }
};

// ==========================
// Get all orders (Admin only)
// ==========================
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [orders, totalCount, statusCounts] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'name email')
        .populate('items.productId', 'title sku')
        .lean(),
      Order.countDocuments(filter),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);

    const statusSummary = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json({
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1,
          limit: parseInt(limit)
        },
        summary: {
          statusCounts: statusSummary,
          totalOrders: totalCount
        }
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};

// ==========================
// Update order status (Admin)
// ==========================
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'COD_CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status', code: 'INVALID_STATUS', validStatuses });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
    }

    const validTransitions = {
      'PENDING': ['PAID', 'COD_CONFIRMED', 'CANCELLED'],
      'PAID': ['COMPLETED', 'CANCELLED'],
      'COD_CONFIRMED': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from ${order.status} to ${status}`,
        code: 'INVALID_TRANSITION',
        currentStatus: order.status,
        allowedTransitions: validTransitions[order.status]
      });
    }

    order.status = status;
    if (status === 'COMPLETED') order.completedAt = new Date();
    if (status === 'CANCELLED') {
      order.cancelledAt = new Date();
      await restoreOrderStock(order);
    }

    await order.save();
    res.json({ message: 'Order status updated successfully', data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// ==========================
// Order stats (Admin)
// ==========================
const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      statusBreakdown,
      revenueStats,
      topProducts
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: { $in: ['PAID', 'COMPLETED'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, avgOrderValue: { $avg: '$totalAmount' }, totalPaidOrders: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { status: { $in: ['PAID', 'COMPLETED'] } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', productTitle: { $first: '$items.title' }, totalQuantity: { $sum: '$items.qty' }, totalRevenue: { $sum: '$items.subtotal' } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } }
      ])
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0, totalPaidOrders: 0 };

    res.json({
      message: 'Order statistics retrieved successfully',
      data: {
        overview: { totalOrders, todayOrders, weekOrders, monthOrders },
        statusBreakdown: statusBreakdown.reduce((acc, curr) => { acc[curr._id] = curr.count; return acc; }, {}),
        revenue: {
          totalRevenue: revenue.totalRevenue,
          averageOrderValue: Math.round(revenue.avgOrderValue || 0),
          totalPaidOrders: revenue.totalPaidOrders
        },
        topProducts: topProducts.map(item => ({
          productId: item._id,
          title: item.productTitle,
          totalQuantitySold: item.totalQuantity,
          totalRevenue: item.totalRevenue,
          product: item.product[0] || null
        }))
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve order statistics' });
  }
};

// ==========================
// Helper: Restore stock
// ==========================
const restoreOrderStock = async (order) => {
  try {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } });
    }
  } catch (error) {
    console.error('Error restoring stock:', error);
  }
};

module.exports = { getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getOrderStats };
