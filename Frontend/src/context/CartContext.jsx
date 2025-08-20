import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load cart from localStorage for guests, API for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      loadLocalCart();
    }
  }, [isAuthenticated]);

  const loadLocalCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveLocalCart = (cartData) => {
    localStorage.setItem('cart', JSON.stringify(cartData));
  };

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/cart');
      setCart(response.data.cart || { items: [], total: 0 });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      loadLocalCart(); // Fallback to local cart
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      if (isAuthenticated) {
        const response = await axios.post('/cart', {
          productId: product._id,
          qty: quantity
        });
        setCart(response.data.cart);
        toast.success('Added to cart');
      } else {
        // Handle local cart for guests
        const existingItemIndex = cart.items.findIndex(
          item => item.productId === product._id
        );

        let newItems;
        if (existingItemIndex >= 0) {
          newItems = cart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, qty: item.qty + quantity, subtotal: (item.qty + quantity) * item.price }
              : item
          );
        } else {
          newItems = [
            ...cart.items,
            {
              productId: product._id,
              title: product.title,
              price: product.price,
              qty: quantity,
              subtotal: product.price * quantity,
              image: product.images?.[0]
            }
          ];
        }

        const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
        const newCart = { items: newItems, total: newTotal };
        
        setCart(newCart);
        saveLocalCart(newCart);
        toast.success('Added to cart');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    try {
      if (isAuthenticated) {
        const response = await axios.post('/cart', {
          productId,
          qty: quantity
        });
        setCart(response.data.cart);
      } else {
        const newItems = cart.items.map(item =>
          item.productId === productId
            ? { ...item, qty: quantity, subtotal: quantity * item.price }
            : item
        );
        
        const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
        const newCart = { items: newItems, total: newTotal };
        
        setCart(newCart);
        saveLocalCart(newCart);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        await axios.delete(`/cart/${productId}`);
        fetchCart();
        toast.success('Removed from cart');
      } else {
        const newItems = cart.items.filter(item => item.productId !== productId);
        const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
        const newCart = { items: newItems, total: newTotal };
        
        setCart(newCart);
        saveLocalCart(newCart);
        toast.success('Removed from cart');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from cart';
      toast.error(message);
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await axios.delete('/cart');
        setCart({ items: [], total: 0 });
      } else {
        setCart({ items: [], total: 0 });
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const getItemCount = () => {
    return cart.items.reduce((count, item) => count + item.qty, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemCount,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};