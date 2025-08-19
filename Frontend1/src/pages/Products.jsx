import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../Components/ui/badge'
import { Skeleton } from '../components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '../Components/ui/sheet';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'sonner'; 


const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { addToCart } = useCart();

  // Mock categories for demo when API is unavailable
  const mockCategories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty'];

  // Mock products for demo when API is unavailable
  const mockProducts = [
    {
      _id: 'mock-1',
      title: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 2499,
      mrp: 3999,
      stock: 15,
      category: 'Electronics',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400']
    },
    {
      _id: 'mock-2',
      title: 'Smartphone Case Premium',
      description: 'Durable smartphone case with premium materials',
      price: 599,
      mrp: 999,
      stock: 8,
      category: 'Electronics',
      images: ['https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=400']
    },
    {
      _id: 'mock-3',
      title: 'USB-C Fast Charger',
      description: 'Fast charging cable with USB-C connector',
      price: 899,
      mrp: 1299,
      stock: 0,
      category: 'Electronics',
      images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400']
    },
    {
      _id: 'mock-4',
      title: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      price: 1299,
      mrp: 1899,
      stock: 22,
      category: 'Electronics',
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400']
    },
    {
      _id: 'mock-5',
      title: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt in various colors',
      price: 799,
      mrp: 1299,
      stock: 30,
      category: 'Clothing',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400']
    },
    {
      _id: 'mock-6',
      title: 'Programming Book',
      description: 'Learn programming fundamentals with this comprehensive guide',
      price: 1999,
      mrp: 2999,
      stock: 12,
      category: 'Books',
      images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']
    }
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchQuery, selectedCategory, sortBy, page]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy !== 'latest') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, sortBy, setSearchParams]);

  const fetchProducts = async (reset = false) => {
    try {
      if (reset) setLoading(true);
      
      const params = new URLSearchParams({
        page: reset ? 1 : page,
        limit: 12
      });
      
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);

      const response = await axios.get(`/products?${params}`);
      const newProducts = response.data.products || [];
      
      if (reset || page === 1) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setHasMore(newProducts.length === 12);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Use mock products when API is unavailable
      let filteredProducts = mockProducts;
      
      // Apply filters to mock data
      if (selectedCategory && selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
      }
      
      if (searchQuery) {
        filteredProducts = filteredProducts.filter(p => 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setProducts(filteredProducts);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/products/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Use mock categories when API is unavailable
      setCategories(mockCategories);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(true);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
    fetchProducts(true);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(1);
    fetchProducts(true);
  };

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    await addToCart(product, 1);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Sort By</label>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const ProductCard = ({ product }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <Link to={`/product/${product._id}`}>
          <div className={`${viewMode === 'grid' ? 'aspect-square' : 'h-48'} overflow-hidden rounded-t-lg`}>
            <ImageWithFallback
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        <div className="p-4 space-y-3">
          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
              {product.title}
            </h3>
          </Link>
          
          {viewMode === 'list' && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

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
                  In Stock ({product.stock})
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  Out of Stock
                </Badge>
              )}
            </div>
            
            <Button
              size="sm"
              onClick={() => handleAddToCart(product)}
              disabled={product.stock <= 0}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            {searchQuery && `Search results for "${searchQuery}"`}
            {selectedCategory && selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Filter */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Products Grid */}
      {loading && page === 1 ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found.</p>
          {(searchQuery || (selectedCategory && selectedCategory !== 'all')) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPage(1);
                fetchProducts(true);
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;