import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { Button } from '../../Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../Components/ui/input';
import { Badge } from '../../Components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import ProductScanner from '../../Components/productScanner';
import { useForm } from "react-hook-form";
import axios from 'axios';
import { toast } from "sonner";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Mock data for when API is unavailable
  const mockProducts = [
    {
      _id: 'mock-1',
      title: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 2499,
      mrp: 3999,
      stock: 15,
      category: 'Electronics',
      sku: 'WBH-001',
      barcode: '1234567890123',
      isActive: true,
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
      sku: 'SCP-002',
      barcode: '2345678901234',
      isActive: true,
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
      sku: 'UCC-003',
      barcode: '3456789012345',
      isActive: false,
      images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400']
    }
  ];

  const mockCategories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      
      const response = await axios.get(`/products?${params}&admin=true`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      
      // Use mock data when API is unavailable
      let filteredProducts = mockProducts;
      if (searchQuery) {
        filteredProducts = mockProducts.filter(p => 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setProducts(filteredProducts);
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
      setCategories(mockCategories);
    }
  };

  const handleScanResult = (barcode) => {
    setValue('barcode', barcode);
    setValue('sku', barcode);
    toast.info(`Barcode scanned: ${barcode}`);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'images' && data[key][0]) {
          for (let i = 0; i < data[key].length; i++) {
            formData.append('images', data[key][i]);
          }
        } else {
          formData.append(key, data[key]);
        }
      });

      if (editingProduct) {
        await axios.put(`/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      reset();
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      
      // For demo purposes, simulate success when API is unavailable
      if (error.code === 'ERR_NETWORK') {
        const action = editingProduct ? 'updated' : 'created';
        toast.success(`Demo product ${action} successfully!`);
        setIsDialogOpen(false);
        setEditingProduct(null);
        reset();
        fetchProducts();
      } else {
        toast.error('Failed to save product');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    Object.keys(product).forEach(key => {
      if (key !== 'images') {
        setValue(key, product[key]);
      }
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/products/${productId}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
        
        // For demo purposes, simulate success when API is unavailable
        if (error.code === 'ERR_NETWORK') {
          toast.success('Demo product deleted successfully!');
          fetchProducts();
        } else {
          toast.error('Failed to delete product');
        }
      }
    }
  };

  const toggleProductStatus = async (productId, isActive) => {
    try {
      await axios.put(`/products/${productId}`, { isActive: !isActive });
      toast.success(`Product ${!isActive ? 'activated' : 'deactivated'}`);
      fetchProducts();
    } catch (error) {
      console.error('Failed to update product status:', error);
      
      // For demo purposes, simulate success when API is unavailable
      if (error.code === 'ERR_NETWORK') {
        toast.success(`Demo product ${!isActive ? 'activated' : 'deactivated'}!`);
        fetchProducts();
      } else {
        toast.error('Failed to update product status');
      }
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    reset();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-80 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        
        <div className="flex items-center space-x-2">
          <ProductScanner onScanResult={handleScanResult}>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Scan & Add
            </Button>
          </ProductScanner>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct 
                    ? 'Update the product information below.'
                    : 'Fill in the details to add a new product to your inventory.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Enter product title"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register('price', { required: 'Price is required' })}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mrp">MRP (₹)</Label>
                    <Input
                      id="mrp"
                      type="number"
                      step="0.01"
                      {...register('mrp')}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      {...register('stock', { required: 'Stock is required' })}
                      placeholder="0"
                    />
                    {errors.stock && (
                      <p className="text-sm text-destructive">{errors.stock.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => setValue('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      {...register('sku')}
                      placeholder="Product SKU"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      {...register('barcode')}
                      placeholder="Product barcode"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Product Images</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    {...register('images')}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch {...register('isActive')} />
                  <Label>Active Product</Label>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2 max-w-md">
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
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product._id}>
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <ImageWithFallback
                    src={product.images?.[0] || '/placeholder-product.jpg'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                    <Badge variant={product.isActive ? 'secondary' : 'destructive'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
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
                    <p className="text-sm text-muted-foreground">
                      Stock: {product.stock} • Category: {product.category || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleProductStatus(product._id, product.isActive)}
                    >
                      {product.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}
          </p>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;