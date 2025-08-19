const Order = require('../models/Order');
const WebhookLog = require('../models/WebhookLog');
const { verifyRazorpaySignature } = require('../services/razorpayService');
const { verifyStripeSignature } = require('../services/stripeService');

// ---------- Razorpay ----------
const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.get('X-Razorpay-Signature');
    const body = req.body;

    const webhookLog = new WebhookLog({
      provider: 'razorpay',
      eventType: body.event || 'unknown',
      rawPayload: body,
      signature,
      status: 'pending'
    });

    if (!verifyRazorpaySignature(body, signature)) {
      webhookLog.status = 'failed';
      webhookLog.errorMessage = 'Invalid signature';
      await webhookLog.save();

      return res.status(400).json({ message: 'Invalid signature', code: 'INVALID_SIGNATURE' });
    }

    switch (body.event) {
      case 'payment.captured':
        await handleRazorpayPaymentSuccess(body.payload, webhookLog);
        break;
      case 'payment.failed':
        await handleRazorpayPaymentFailed(body.payload, webhookLog);
        break;
      default:
        webhookLog.status = 'success';
        break;
    }

    webhookLog.processedAt = new Date();
    await webhookLog.save();
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

const handleRazorpayPaymentSuccess = async (payload, webhookLog) => {
  try {
    const payment = payload.payment.entity;
    const order = await Order.findOne({
      'providerIds.orderId': payment.order_id,
      paymentProvider: 'razorpay'
    });

    webhookLog.orderId = payment.notes?.orderId;
    webhookLog.paymentId = payment.id;

    if (!order) throw new Error(`Order not found for ID: ${payment.order_id}`);

    order.status = process.env.AUTO_COMPLETE_ORDERS === 'true' ? 'COMPLETED' : 'PAID';
    if (order.status === 'COMPLETED') order.completedAt = new Date();
    order.providerIds.paymentId = payment.id;

    await order.save();
    webhookLog.status = 'success';
  } catch (error) {
    webhookLog.status = 'failed';
    webhookLog.errorMessage = error.message;
    throw error;
  }
};

const handleRazorpayPaymentFailed = async (payload, webhookLog) => {
  try {
    const payment = payload.payment.entity;
    const order = await Order.findOne({
      'providerIds.orderId': payment.order_id,
      paymentProvider: 'razorpay'
    });

    webhookLog.orderId = payment.notes?.orderId;
    webhookLog.paymentId = payment.id;

    if (order) {
      order.status = 'CANCELLED';
      order.failureReason = payment.error_description || 'Payment failed';
      order.cancelledAt = new Date();
      await order.save();
      await restoreOrderStock(order);
    }

    webhookLog.status = 'success';
  } catch (error) {
    webhookLog.status = 'failed';
    webhookLog.errorMessage = error.message;
    throw error;
  }
};

// ---------- Stripe ----------
const handleStripeWebhook = async (req, res) => {
  try {
    const signature = req.get('stripe-signature');
    const body = req.body;

    const webhookLog = new WebhookLog({
      provider: 'stripe',
      eventType: 'unknown',
      rawPayload: body,
      signature,
      status: 'pending'
    });

    const event = verifyStripeSignature(body, signature);
    if (!event) {
      webhookLog.status = 'failed';
      webhookLog.errorMessage = 'Invalid signature';
      await webhookLog.save();
      return res.status(400).json({ message: 'Invalid signature', code: 'INVALID_SIGNATURE' });
    }

    webhookLog.eventType = event.type;
    if (event.type === 'payment_intent.succeeded') {
      await handleStripePaymentSuccess(event.data.object, webhookLog);
    } else if (event.type === 'payment_intent.payment_failed') {
      await handleStripePaymentFailed(event.data.object, webhookLog);
    } else {
      webhookLog.status = 'success';
    }

    webhookLog.processedAt = new Date();
    await webhookLog.save();
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

const handleStripePaymentSuccess = async (paymentIntent, webhookLog) => {
  try {
    const order = await Order.findOne({ orderId: paymentIntent.metadata.orderId });

    webhookLog.orderId = paymentIntent.metadata.orderId;
    webhookLog.paymentId = paymentIntent.id;

    if (!order) throw new Error(`Order not found: ${paymentIntent.metadata.orderId}`);

    order.status = process.env.AUTO_COMPLETE_ORDERS === 'true' ? 'COMPLETED' : 'PAID';
    if (order.status === 'COMPLETED') order.completedAt = new Date();
    order.providerIds.paymentId = paymentIntent.id;

    await order.save();
    webhookLog.status = 'success';
  } catch (error) {
    webhookLog.status = 'failed';
    webhookLog.errorMessage = error.message;
    throw error;
  }
};

const handleStripePaymentFailed = async (paymentIntent, webhookLog) => {
  try {
    const order = await Order.findOne({ orderId: paymentIntent.metadata.orderId });

    webhookLog.orderId = paymentIntent.metadata.orderId;
    webhookLog.paymentId = paymentIntent.id;

    if (order) {
      order.status = 'CANCELLED';
      order.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
      order.cancelledAt = new Date();
      await order.save();
      await restoreOrderStock(order);
    }

    webhookLog.status = 'success';
  } catch (error) {
    webhookLog.status = 'failed';
    webhookLog.errorMessage = error.message;
    throw error;
  }
};

// ---------- Helper ----------
const restoreOrderStock = async (order) => {
  const Product = require('../models/Product');
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } });
  }
};

module.exports = {
  handleRazorpayWebhook,
  handleStripeWebhook
};
