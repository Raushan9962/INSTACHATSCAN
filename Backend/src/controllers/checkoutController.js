const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createRazorpayOrder } = require('../services/razorpayService');
const { createStripeOrder } = require('../services/stripeService');

// Create order
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, deliveryNotes } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty', code: 'EMPTY_CART' });
    }

    const stockValidation = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (!product || !product.isActive) {
        stockValidation.push({ productId: item.productId._id, title: item.title, issue: 'Product not available' });
      } else if (product.stock < item.qty) {
        stockValidation.push({ productId: item.productId._id, title: item.title, issue: `Only ${product.stock} items available`, availableStock: product.stock });
      }
    }

    if (stockValidation.length > 0) {
      return res.status(400).json({ message: 'Stock validation failed', code: 'STOCK_VALIDATION_FAILED', issues: stockValidation });
    }

    const orderData = {
      userId,
      items: cart.items.map(item => ({
        productId: item.productId._id,
        title: item.title,
        price: item.price,
        qty: item.qty,
        subtotal: item.subtotal
      })),
      shippingAddress,
      paymentMethod,
      totalAmount: cart.total,
      deliveryNotes: deliveryNotes || ''
    };

    if (paymentMethod === 'COD') {
      orderData.status = 'COD_CONFIRMED';
      if (process.env.AUTO_COMPLETE_ORDERS === 'true') {
        orderData.status = 'COMPLETED';
        orderData.completedAt = new Date();
      }
    }

    const order = new Order(orderData);
    await order.save();

    let paymentData = null;
    if (paymentMethod === 'ONLINE') {
      const provider = process.env.DEFAULT_PAYMENT_PROVIDER || 'razorpay';
      if (provider === 'razorpay') {
        paymentData = await createRazorpayOrder(order);
        order.paymentProvider = 'razorpay';
        order.providerIds.orderId = paymentData.orderId;
      } else if (provider === 'stripe') {
        paymentData = await createStripeOrder(order);
        order.paymentProvider = 'stripe';
        order.providerIds.orderId = paymentData.clientSecret;
      }
      await order.save();
    }

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, { $inc: { stock: -item.qty } });
    }

    await Cart.findOneAndUpdate({ userId }, { $set: { items: [], total: 0 } });

    res.status(201).json({ message: 'Order created successfully', data: { order, paymentData } });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Confirm COD order
const confirmCODOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });

    if (order.paymentMethod !== 'COD') return res.status(400).json({ message: 'This is not a COD order', code: 'NOT_COD_ORDER' });
    if (order.status !== 'COD_CONFIRMED') return res.status(400).json({ message: 'Order is not in COD_CONFIRMED status', code: 'INVALID_STATUS' });

    order.status = 'COMPLETED';
    order.completedAt = new Date();
    await order.save();

    res.json({ message: 'COD order confirmed and completed', data: order });
  } catch (error) {
    console.error('Confirm COD order error:', error);
    res.status(500).json({ message: 'Failed to confirm COD order', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

module.exports = { createOrder, confirmCODOrder };
