

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Stripe secret key missing in env");
}

module.exports = stripe;
