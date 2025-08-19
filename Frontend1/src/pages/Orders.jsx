import React, { useState, useEffect } from 'react';
import { Package, Eye, Download, Clock, CheckCircle, Truck, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import axios from 'axios';
import { toast } from 'sonner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      
      const response = await axios.get(`/orders/my?${params}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'PAID':
        return <CreditCard className="h-4 w-4" />;
      case 'COD_CONFIRMED':
        return <Package className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
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
        return 'Confirmed (COD)';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === 'ALL' || order.status === statusFilter
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-48 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">My Orders</h1>
        
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
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span>•</span>
                      <span>{order.items.length} item(s)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(order.status)}
                        <span>{formatStatus(order.status)}</span>
                      </div>
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-semibold">₹{order.totalAmount}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.paymentMethod === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-16 h-16 overflow-hidden rounded border">
                        <ImageWithFallback
                          src={item.image || '/placeholder-product.jpg'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.qty} × ₹{item.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{item.subtotal}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Shipping Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{order.address.name}</p>
                      <p>{order.address.address}</p>
                      <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                      <p>Phone: {order.address.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {order.status === 'COMPLETED' && (
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Progress */}
                {order.status !== 'PENDING' && (
                  <div className="pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className={`flex items-center space-x-2 ${
                        ['PAID', 'COD_CONFIRMED', 'COMPLETED'].includes(order.status) 
                          ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        <CheckCircle className="h-4 w-4" />
                        <span>Order Confirmed</span>
                      </div>
                      
                      <div className={`flex items-center space-x-2 ${
                        order.status === 'COMPLETED' 
                          ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        <Truck className="h-4 w-4" />
                        <span>Delivered</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          order.status === 'COMPLETED' 
                            ? 'bg-green-500 w-full' 
                            : 'bg-blue-500 w-1/2'
                        }`}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-xl font-semibold mb-4">
            {statusFilter === 'ALL' ? 'No orders found' : `No ${formatStatus(statusFilter).toLowerCase()} orders`}
          </h2>
          <p className="text-muted-foreground mb-8">
            {statusFilter === 'ALL' 
              ? "You haven't placed any orders yet." 
              : `You don't have any ${formatStatus(statusFilter).toLowerCase()} orders.`}
          </p>
          <Button onClick={() => window.location.href = '/products'}>
            Start Shopping
          </Button>
        </div>
      )}
    </div>
  );
};

export default Orders;