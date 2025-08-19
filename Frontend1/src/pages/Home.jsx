import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Scan, CreditCard, Truck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import axios from 'axios';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock products for demo when API is unavailable
  const mockProducts = [
    {
      _id: 'mock-1',
      title: 'Wireless Bluetooth Headphones',
      price: 2499,
      mrp: 3999,
      stock: 15,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400']
    },
    {
      _id: 'mock-2',
      title: 'Smartphone Case Premium',
      price: 599,
      mrp: 999,
      stock: 8,
      images: ['https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=400']
    },
    {
      _id: 'mock-3',
      title: 'USB-C Fast Charger',
      price: 899,
      mrp: 1299,
      stock: 0,
      images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400']
    },
    {
      _id: 'mock-4',
      title: 'Wireless Mouse',
      price: 1299,
      mrp: 1899,
      stock: 22,
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400']
    },
    {
      _id: 'mock-5',
      title: 'Bluetooth Speaker',
      price: 3999,
      mrp: 5999,
      stock: 5,
      images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400']
    },
    {
      _id: 'mock-6',
      title: 'Gaming Keyboard',
      price: 4999,
      mrp: 7999,
      stock: 12,
      images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400']
    },
    {
      _id: 'mock-7',
      title: 'Laptop Stand Adjustable',
      price: 1999,
      mrp: 2999,
      stock: 18,
      images: ['https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=400']
    },
    {
      _id: 'mock-8',
      title: 'Webcam HD 1080p',
      price: 2899,
      mrp: 3999,
      stock: 7,
      images: ['https://images.unsplash.com/photo-1552830394-d7b7b593bf39?w=400']
    }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get('/products?limit=8&sort=latest');
      setFeaturedProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      // Use mock products when API is unavailable
      setFeaturedProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const features = [
    {
      icon: Scan,
      title: 'Product Scanning',
      description: 'Quickly add products by scanning barcodes or QR codes'
    },
    {
      icon: ShoppingBag,
      title: 'Easy Shopping',
      description: 'Browse, search, and add products to cart with ease'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Pay online with Razorpay/Stripe or choose Cash on Delivery'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Track your orders and get fast, reliable delivery'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Welcome to <span className="text-primary">ShopScanner</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your one-stop e-commerce solution with product scanning, secure payments, and fast delivery
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button type="submit" size="lg">
            Search
          </Button>
        </form>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Featured Products */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
          <p className="text-muted-foreground">Check out our latest and most popular items</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product._id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <Link to={`/product/${product._id}`}>
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <ImageWithFallback
                          src={product.images?.[0] || '/placeholder-product.jpg'}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-primary">
                                ₹{product.price}
                              </span>
                              {product.mrp && product.mrp > product.price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ₹{product.mrp}
                                </span>
                              )}
                            </div>
                            {product.stock > 0 ? (
                              <Badge variant="secondary" className="text-xs">
                                In Stock
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button size="lg" variant="outline" asChild>
                <Link to="/products">View All Products</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available at the moment.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;