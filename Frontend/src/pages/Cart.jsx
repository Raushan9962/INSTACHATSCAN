import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-32 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button size="lg" asChild>
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Shopping Cart ({cart.items.length} items)</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCart}
          className="text-destructive hover:text-destructive"
        >
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <Link 
                    to={`/product/${item.productId}`}
                    className="flex-shrink-0"
                  >
                    <div className="w-full sm:w-24 h-48 sm:h-24 overflow-hidden rounded-lg border">
                      <ImageWithFallback
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Link 
                          to={`/product/${item.productId}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-primary">
                            ₹{item.price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            each
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.productId, item.qty - 1)}
                          disabled={item.qty <= 1}
                          className="h-10 w-10 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                          {item.qty}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.productId, item.qty + 1)}
                          className="h-10 w-10 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          ₹{item.subtotal}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.qty} × ₹{item.price}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.qty, 0)} items)</span>
                  <span>₹{cart.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{cart.total}</span>
              </div>
              
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  asChild
                >
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Secure checkout with SSL encryption
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;