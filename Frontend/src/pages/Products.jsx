import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../Components/ui/badge';
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
  const [isSearching, setIsSearching] = useState(false);
  const [animateResults, setAnimateResults] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (reset) {
        setLoading(true);
        setIsSearching(true);
      }

      const params = new URLSearchParams({
        page: reset ? 1 : page,
        limit: 12
      });

      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);

      const response = await axios.get(`http://localhost:5000/api/products?${params}`);
      const newProducts = response.data.products || [];

      if (reset || page === 1) {
        setProducts(newProducts);
        setAnimateResults(true);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      setHasMore(newProducts.length === 12);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products/categories");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error("Failed to load categories");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAnimateResults(false);
    fetchProducts(true);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
    setAnimateResults(false);
    fetchProducts(true);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(1);
    setAnimateResults(false);
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
            {categories.map((category, index) => (
              <SelectItem key={index} value={category}>
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

  const ProductCard = ({ product, index }) => (
    <Card
      className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-md ${
        animateResults ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : ''
      }`}
      style={animateResults ? { animationDelay: `${index * 100}ms` } : {}}
    >
      <CardContent className="p-0 overflow-hidden rounded-lg">
        <Link to={`/product/${product._id}`} className="block relative overflow-hidden">
          <div className={`${viewMode === 'grid' ? 'aspect-square' : 'h-48'} overflow-hidden`}>
            <ImageWithFallback
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-semibold text-lg animate-pulse">Out of Stock</span>
              </div>
            )}
          </div>
        </Link>
        <div className="p-4 space-y-3">
          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold line-clamp-2 hover:text-primary">{product.title}</h3>
          </Link>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-primary">₹{product.price}</span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-sm line-through opacity-75">₹{product.mrp}</span>
                )}
              </div>
              {product.stock > 0 ? (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                  In Stock ({product.stock})
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
              )}
            </div>
            <Button size="sm" onClick={() => handleAddToCart(product)} disabled={product.stock <= 0}>
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SkeletonCard = ({ index }) => (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
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
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </form>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category, index) => (
                <SelectItem key={index} value={category}>
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
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} index={index} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
            {products.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products found.</p>
          {(searchQuery || (selectedCategory && selectedCategory !== 'all')) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPage(1);
                setAnimateResults(false);
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
