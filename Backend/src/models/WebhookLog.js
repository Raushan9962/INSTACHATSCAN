// src/models/WebhookLog.js
const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['razorpay', 'stripe'],
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  orderId: String,
  paymentId: String,
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    required: true
  },
  rawPayload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  signature: String,
  processedAt: Date,
  errorMessage: String
}, {
  timestamps: true
});

webhookLogSchema.index({ provider: 1, createdAt: -1 });
webhookLogSchema.index({ orderId: 1 });

module.exports = mongoose.model('WebhookLog', webhookLogSchema);