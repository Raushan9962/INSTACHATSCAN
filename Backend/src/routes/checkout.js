const express = require('express');
const router = express.Router();
const { createOrder, confirmCODOrder } = require('../controllers/checkoutController');
const { auth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All checkout routes require authentication
router.use(auth);

router.post('/create-order', validate(schemas.createOrder), createOrder);
router.post('/confirm-cod/:orderId', confirmCODOrder);

module.exports = router;

