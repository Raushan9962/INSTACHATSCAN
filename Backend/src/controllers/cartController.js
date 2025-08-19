const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId', 'title price stock images isActive');

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [], total: 0 });
      await cart.save();
    }

    const activeItems = cart.items.filter(item => item.productId && item.productId.isActive);
    if (activeItems.length !== cart.items.length) {
      cart.items = activeItems;
      await cart.save();
    }

    res.json({ message: 'Cart retrieved successfully', data: cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to retrieve cart', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or inactive', code: 'PRODUCT_NOT_FOUND' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock`, code: 'INSUFFICIENT_STOCK', availableStock: product.stock });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [], total: 0 });

    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].qty + qty;
      if (product.stock < newQty) {
        return res.status(400).json({ message: `Only ${product.stock} items available in stock`, code: 'INSUFFICIENT_STOCK', availableStock: product.stock });
      }
      cart.items[existingItemIndex].qty = newQty;
      cart.items[existingItemIndex].price = product.price;
      cart.items[existingItemIndex].subtotal = product.price * newQty;
    } else {
      cart.items.push({ productId, title: product.title, price: product.price, qty, subtotal: product.price * qty });
    }

    await cart.save();
    await cart.populate('items.productId', 'title price stock images isActive');

    res.json({ message: 'Item added to cart successfully', data: cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add item to cart', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { qty } = req.body;
    const userId = req.user._id;

    if (!qty || qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1', code: 'INVALID_QUANTITY' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or inactive', code: 'PRODUCT_NOT_FOUND' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock`, code: 'INSUFFICIENT_STOCK', availableStock: product.stock });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found', code: 'CART_NOT_FOUND' });

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart', code: 'ITEM_NOT_FOUND' });

    cart.items[itemIndex].qty = qty;
    cart.items[itemIndex].price = product.price;
    cart.items[itemIndex].subtotal = product.price * qty;

    await cart.save();
    await cart.populate('items.productId', 'title price stock images isActive');

    res.json({ message: 'Cart item updated successfully', data: cart });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Failed to update cart item', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found', code: 'CART_NOT_FOUND' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    await cart.populate('items.productId', 'title price stock images isActive');

    res.json({ message: 'Item removed from cart successfully', data: cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Failed to remove item from cart', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [], total: 0 });
    else {
      cart.items = [];
      cart.total = 0;
    }

    await cart.save();
    res.json({ message: 'Cart cleared successfully', data: cart });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
