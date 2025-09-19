import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: number;
  order_id: string;
  customer_info: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    province: string;
    note: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  total: number;
  status: string;
  created_at: string;
  payment_method: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();
  
  const statusOptions = ['All', 'pending', 'shipped', 'delivered', 'cancelled'];

  // Fetch orders from database
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
        } else {
          setOrders(data || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_info.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_info.phone.includes(searchTerm)
      );
    }
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'shipped':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-warning bg-warning/10';
      case 'shipped':
        return 'text-primary bg-primary/10';
      case 'delivered':
        return 'text-success bg-success/10';
      case 'cancelled':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('order_id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      const updatedOrders = orders.map(order =>
        order.order_id === orderId ? { ...order, status: newStatus } : order
      );
      
      setOrders(updatedOrders);
      
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });

      // If shipped, notify webhook via GET with order details
      if (newStatus === 'shipped') {
        const order = updatedOrders.find(o => o.order_id === orderId);
        if (order) {
          try {
            const baseUrl = 'https://n8n-covv.onrender.com/webhook/shiped';
            const url = new URL(baseUrl);
            const params = new URLSearchParams();

            params.set('event', 'order_shipped');
            params.set('orderId', order.order_id);
            params.set('total', Number(order.items.reduce((sum, it) => sum + it.price * it.quantity, 0)).toFixed(2));
            params.set('paymentMethod', order.payment_method || '');
            params.set('orderDate', order.created_at);

            // Customer details
            params.set('customer_fullName', order.customer_info.fullName || '');
            params.set('customer_phoneNumber', order.customer_info.phone || '');
            if (order.customer_info.email) params.set('customer_email', order.customer_info.email);
            params.set('customer_deliveryAddress', order.customer_info.address || '');
            params.set('customer_city', order.customer_info.city || '');
            params.set('customer_province', order.customer_info.province || '');
            if (order.customer_info.note) params.set('customer_note', order.customer_info.note);

            // Items with URLs
            const itemsPayload = order.items.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              total: Number((item.price * item.quantity).toFixed(2)),
              url: `${window.location.origin}/product/${item.id}`,
            }));
            params.set('items', JSON.stringify(itemsPayload));
            params.set('itemsCount', String(order.items.reduce((sum, it) => sum + it.quantity, 0)));

            url.search = params.toString();
            await fetch(url.toString(), { method: 'GET' });
            console.log('Shipment webhook (GET) notified successfully');
          } catch (webhookError) {
            console.error('Failed to notify shipment webhook (GET):', webhookError);
          }
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">Manage and review customer orders</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID, customer name, or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>Overview of all customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{order.customer_info.fullName}</div>
                            <div className="text-xs text-muted-foreground">{order.customer_info.phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ${order.items.reduce((sum, it) => sum + it.price * it.quantity, 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openOrderDetails(order)}>
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Order Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>Review order information and update status</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{selectedOrder.customer_info.fullName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{selectedOrder.customer_info.phone}</div>
                        {selectedOrder.customer_info.email && (
                          <div className="text-sm text-muted-foreground">{selectedOrder.customer_info.email}</div>
                        )}
                        <div className="text-sm">{selectedOrder.customer_info.address}</div>
                        <div className="text-sm text-muted-foreground">{selectedOrder.customer_info.city}, {selectedOrder.customer_info.province}</div>
                        {selectedOrder.customer_info.note && (
                          <div className="text-sm">Note: {selectedOrder.customer_info.note}</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                                </div>
                              </div>
                              <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                          ))}
                          <div className="pt-3 border-t">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-bold">${selectedOrder.items.reduce((sum, it) => sum + it.price * it.quantity, 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Quick Status Update */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      updateOrderStatus(selectedOrder.order_id, value);
                      setSelectedOrder({...selectedOrder, status: value});
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;