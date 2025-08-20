import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Scan, CreditCard, Truck } from 'lucide-react';

// Mock components for demonstration
const Button = ({ children, className = '', size, variant, asChild, type, onClick, ...props }) => {
  const Component = asChild ? 'a' : 'button';
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizeClasses = size === 'lg' ? 'h-12 px-8 text-lg' : 'h-10 px-6 text-sm';
  const variantClasses = variant === 'outline' 
    ? 'border-2 border-green-800 text-green-800 hover:bg-green-800 hover:text-white hover:shadow-lg' 
    : 'bg-green-800 text-white hover:bg-green-900 shadow-lg hover:shadow-xl';
    
  return (
    <Component
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

const Input = ({ className = '', type, ...props }) => (
  <input
    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all duration-200 hover:border-green-600 ${className}`}
    type={type}
    {...props}
  />
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant, className = '' }) => {
  const variantClasses = variant === 'destructive' 
    ? 'bg-red-100 text-red-800 border-red-200' 
    : 'bg-green-100 text-green-800 border-green-200';
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};

const ImageWithFallback = ({ src, alt, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="relative overflow-hidden">
      {!imageError ? (
        <img
          src={src}
          alt={alt}
          className={`transition-all duration-500 ${className}`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
      )}
    </div>
  );
};

const Link = ({ to, children, className = '' }) => (
  <a href={to} className={className}>
    {children}
  </a>
);

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState({});

  // Mock products for demo
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
    // Simulate API call
    setTimeout(() => {
      setFeaturedProducts(mockProducts);
      setLoading(false);
    }, 1000);

    // Animate sections on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe sections
    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery.trim());
    }
  };

  const features = [
    {
      icon: Scan,
      title: 'Product Scanning',
      description: 'Quickly add products by scanning barcodes or QR codes',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: ShoppingBag,
      title: 'Easy Shopping',
      description: 'Browse, search, and add products to cart with ease',
      color: 'text-green-800',
      bgColor: 'bg-green-100'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Pay online with Razorpay/Stripe or choose Cash on Delivery',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Track your orders and get fast, reliable delivery',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-20">
        
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 animate-fade-in-up">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent animate-pulse">
                ShopScanner
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Your one-stop e-commerce solution with product scanning, secure payments, and fast delivery
            </p>
          </div>

          {/* Search Bar */}
          <div className="animate-fade-in-up animation-delay-400">
            <div className="max-w-md mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors duration-200 group-focus-within:text-blue-500" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-full border-2 shadow-lg focus:shadow-xl transition-all duration-300"
                />
                <Button 
                  type="submit" 
                  onClick={handleSearch}
                  className="absolute right-2 top-2 h-10 px-6 rounded-full"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up animation-delay-600">
            <Button size="lg" className="group">
              <Link to="/products" className="flex items-center space-x-2">
                <span>Browse Products</span>
                <ShoppingBag className="h-5 w-5 transition-transform group-hover:rotate-12" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="group">
              <Link to="/register" className="flex items-center space-x-2">
                <span>Get Started</span>
                <div className="w-5 h-5 rounded-full bg-green-800 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"></div>
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section 
          id="features"
          data-animate
          className={`transition-all duration-1000 transform ${
            isVisible.features ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ShopScanner?</h2>
            <p className="text-gray-600">Discover the features that make shopping effortless</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`transform transition-all duration-700 hover:scale-105 ${
                  isVisible.features ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Card className="text-center h-full group hover:shadow-2xl">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-full ${feature.bgColor} mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="group-hover:text-green-800 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section 
          id="products"
          data-animate
          className={`transition-all duration-1000 transform ${
            isVisible.products ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-600">Check out our latest and most popular items</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-48 mb-4 animate-shimmer"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-shimmer"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className={`transform transition-all duration-700 ${
                      isVisible.products ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <Card className="group hover:shadow-2xl overflow-hidden">
                      <CardContent className="p-0">
                        <Link to={`/product/${product._id}`}>
                          <div className="aspect-square overflow-hidden relative">
                            <ImageWithFallback
                              src={product.images?.[0] || '/placeholder-product.jpg'}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {product.stock === 0 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">Out of Stock</span>
                              </div>
                            )}
                          </div>
                          <div className="p-6 space-y-3">
                            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-800 transition-colors duration-300">
                              {product.title}
                            </h3>
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xl font-bold text-green-600">
                                    ₹{product.price.toLocaleString()}
                                  </span>
                                  {product.mrp && product.mrp > product.price && (
                                    <span className="text-sm text-gray-400 line-through">
                                      ₹{product.mrp.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                {product.mrp && product.mrp > product.price && (
                                  <div className="text-xs text-green-600 font-medium">
                                    Save ₹{(product.mrp - product.price).toLocaleString()} 
                                    ({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off)
                                  </div>
                                )}
                                <Badge 
                                  variant={product.stock > 0 ? "secondary" : "destructive"}
                                  className="animate-pulse"
                                >
                                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12 animate-fade-in-up">
                <Button size="lg" variant="outline" className="group">
                  <Link to="/products" className="flex items-center space-x-2">
                    <span>View All Products</span>
                    <div className="w-0 group-hover:w-5 h-5 overflow-hidden transition-all duration-300">
                      <div className="w-5 h-5 rounded-full bg-green-800"></div>
                    </div>
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No products available at the moment.</p>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -468px 0;
          }
          100% {
            background-position: 468px 0;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-shimmer {
          background: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
          background-size: 800px 104px;
          animation: shimmer 1.5s linear infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-600 {
          animation-delay: 600ms;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Home; 