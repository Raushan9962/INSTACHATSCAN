import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Badge } from '../Components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Mock product data for when API is unavailable
  const mockProducts = {
    'mock-1': {
      _id: 'mock-1',
      title: 'Wireless Bluetooth Headphones',
      description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music, calls, and gaming.',
      price: 2499,
      mrp: 3999,
      stock: 15,
      category: 'Electronics',
      sku: 'WBH-001',
      barcode: '1234567890123',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600'
      ]
    },
    'mock-2': {
      _id: 'mock-2',
      title: 'Smartphone Case Premium',
      description: 'Durable smartphone case made with premium materials. Provides excellent protection against drops and scratches while maintaining a sleek design.',
      price: 599,
      mrp: 999,
      stock: 8,
      category: 'Electronics',
      sku: 'SCP-002',
      barcode: '2345678901234',
      images: [
        'https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=600',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600'
      ]
    },
    'mock-3': {
      _id: 'mock-3',
      title: 'USB-C Fast Charger',
      description: 'High-speed USB-C charger with intelligent charging technology. Compatible with most modern devices and provides fast, safe charging.',
      price: 899,
      mrp: 1299,
      stock: 0,
      category: 'Electronics',
      sku: 'UCC-003',
      barcode: '3456789012345',
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600'
      ]
    },
    'mock-4': {
      _id: 'mock-4',
      title: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking and long battery life. Perfect for work and gaming with customizable DPI settings.',
      price: 1299,
      mrp: 1899,
      stock: 22,
      category: 'Electronics',
      sku: 'WM-004',
      barcode: '4567890123456',
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
        'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=600'
      ]
    },
    'mock-5': {
      _id: 'mock-5',
      title: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt available in multiple colors. Soft, breathable fabric perfect for everyday wear.',
      price: 799,
      mrp: 1299,
      stock: 30,
      category: 'Clothing',
      sku: 'CTS-005',
      barcode: '5678901234567',
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'
      ]
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/products/${id}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      
      // Check if we have mock data for this product
      if (mockProducts[id]) {
        setProduct(mockProducts[id]);
      } else {
        // If no mock data exists for this ID, redirect to products page
        toast.error('Product not found');
        navigate('/products');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    await addToCart(product, quantity);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    await handleAddToCart();
    navigate('/checkout');
  };

  const incrementQuantity = () => {
    if (quantity < product?.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product URL copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg animate-pulse"></div>
            <div className="flex space-x-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="w-20 h-20 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded animate-pulse"></div>
              <div className="h-6 w-1/2 bg-muted rounded animate-pulse"></div>
              <div className="h-20 w-full bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found</p>
        <Button variant="outline" onClick={() => navigate('/products')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  const discountPercentage = product.mrp && product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <ImageWithFallback
              src={product.images?.[selectedImageIndex] || '/placeholder-product.jpg'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border overflow-hidden ${
                    selectedImageIndex === index ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {product.category && (
                <Badge variant="secondary">{product.category}</Badge>
              )}
              {product.stock > 0 ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  In Stock ({product.stock} available)
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary">
                  ₹{product.price}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.mrp}
                    </span>
                    <Badge variant="destructive" className="text-sm">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Inclusive of all taxes
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* Add to Cart Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 flex items-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1"
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Product Details</h3>
              <div className="space-y-2 text-sm">
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span>{product.sku}</span>
                  </div>
                )}
                {product.barcode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Barcode:</span>
                    <span>{product.barcode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{product.category || 'Uncategorized'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span>{product.stock} units</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;