import React, { useState, useEffect } from 'react';
import { Package, Eye, CheckCircle, Filter, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Separator } from '../../components/ui/separator';
import axios from 'axios';
import { toast } from 'sonner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [searchQuery, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      
      const response = await axios.get(`/orders?${params}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const markOrderComplete = async (orderId) => {
    try {
      await axios.post(`/orders/${orderId}/complete`);
      toast.success('Order marked as completed');
      fetchOrders();
    } catch (error) {
      console.error('Failed to complete order:', error);
      toast.error('Failed to complete order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-blue-100 text-blue-800';
      case 'COD_CONFIRMED':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'PAID':
        return 'Paid';
      case 'COD_CONFIRMED':
        return 'COD Confirmed';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Manage Orders</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Orders</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="COD_CONFIRMED">COD Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-semibold">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <Badge className={getStatusColor(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Customer: {order.address.name}</p>
                      <p>Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                      <p>Payment: {order.paymentMethod === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold">₹{order.totalAmount}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.items.length} item(s)
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Order Details - #{order._id.slice(-8).toUpperCase()}
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Status:</span>
                                <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                                  {formatStatus(order.status)}
                                </Badge>
                              </div>
                              <div>
                                <span className="font-medium">Payment Method:</span>
                                <span className="ml-2">{order.paymentMethod === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}</span>
                              </div>
                              <div>
                                <span className="font-medium">Order Date:</span>
                                <span className="ml-2">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                              </div>
                              <div>
                                <span className="font-medium">Total Amount:</span>
                                <span className="ml-2 font-semibold">₹{order.totalAmount}</span>
                              </div>
                            </div>

                            <Separator />

                            {/* Customer Info */}
                            <div>
                              <h4 className="font-medium mb-2">Customer Information</h4>
                              <div className="text-sm space-y-1">
                                <p><span className="font-medium">Name:</span> {order.address.name}</p>
                                <p><span className="font-medium">Email:</span> {order.address.email}</p>
                                <p><span className="font-medium">Phone:</span> {order.address.phone}</p>
                                <p><span className="font-medium">Address:</span> {order.address.address}</p>
                                <p><span className="font-medium">City:</span> {order.address.city}, {order.address.state} - {order.address.pincode}</p>
                              </div>
                            </div>

                            <Separator />

                            {/* Order Items */}
                            <div>
                              <h4 className="font-medium mb-4">Order Items</h4>
                              <div className="space-y-3">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex items-center space-x-4 p-3 border rounded">
                                    <div className="w-16 h-16 overflow-hidden rounded border">
                                      <ImageWithFallback
                                        src={item.image || '/placeholder-product.jpg'}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium">{item.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Quantity: {item.qty} × ₹{item.price}
                                      </p>
                                    </div>
                                    <div className="font-medium">
                                      ₹{item.subtotal}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {(order.status === 'PAID' || order.status === 'COD_CONFIRMED') && (
                        <Button 
                          size="sm"
                          onClick={() => markOrderComplete(order._id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-4 overflow-x-auto">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 flex-shrink-0">
                        <div className="w-12 h-12 overflow-hidden rounded border">
                          <ImageWithFallback
                            src={item.image || '/placeholder-product.jpg'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium truncate max-w-32">{item.title}</p>
                          <p className="text-muted-foreground">Qty: {item.qty}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Orders will appear here when customers start placing them.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;