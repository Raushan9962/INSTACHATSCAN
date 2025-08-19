const express = require('express');
const router = express.Router();
const { 
  getMyOrders, 
  getOrderById, 
  getAllOrders, 
  updateOrderStatus,
  getOrderStats 
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All order routes require authentication
router.use(auth);

// Customer routes
router.get('/my', validate(schemas.orderQuery), getMyOrders);
router.get('/:orderId', getOrderById);

// Admin routes
router.get('/', adminAuth, validate(schemas.orderQuery), getAllOrders);
router.patch('/:orderId/status', adminAuth, updateOrderStatus);
router.get('/admin/stats', adminAuth, getOrderStats);

module.exports = router;
