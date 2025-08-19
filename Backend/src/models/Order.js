// src/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  qty: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true // ✅ this automatically creates a unique index
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['ONLINE', 'COD'],
    required: true
  },
  paymentProvider: {
    type: String,
    enum: ['razorpay', 'stripe', null],
    default: null
  },
  providerIds: {
    orderId: String,
    paymentId: String,
    signature: String
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'COD_CONFIRMED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryNotes: String,
  failureReason: String,
  completedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderId) {
    this.orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// ✅ Indexes (removed duplicate on orderId)
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
