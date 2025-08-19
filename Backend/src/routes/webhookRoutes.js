const express = require('express');
const router = express.Router();
const { handleRazorpayWebhook, handleStripeWebhook } = require('../controllers/webhookController');

// Webhook routes (no auth required)
router.post('/razorpay', handleRazorpayWebhook);
router.post('/stripe', handleStripeWebhook);

module.exports = router;
