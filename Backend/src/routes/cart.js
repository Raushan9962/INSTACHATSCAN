const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { auth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All cart routes require authentication
router.use(auth);

router.get('/', getCart);
router.post('/', validate(schemas.addToCart), addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
