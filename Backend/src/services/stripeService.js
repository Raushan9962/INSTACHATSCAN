const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Stripe payment intent
const createStripeOrder = async (order) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'inr',
      metadata: {
        orderId: order.orderId,
        userId: order.userId.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    throw new Error('Failed to create Stripe payment intent: ' + error.message);
  }
};

// Verify Stripe webhook signature
const verifyStripeSignature = (body, signature) => {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Stripe webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    return event;
  } catch (error) {
    console.error('Stripe signature verification error:', error);
    return null;
  }
};

module.exports = {
  createStripeOrder,
  verifyStripeSignature
};
