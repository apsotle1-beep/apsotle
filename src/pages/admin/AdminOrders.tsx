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
import ordersData from '@/data/orders.json';

interface Order {
  id: string;
  customerInfo: {
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
  orderDate: string;
  paymentMethod: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>(ordersData);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(ordersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const { toast } = useToast();
  
  const statusOptions = ['All', 'pending', 'shipped', 'delivered', 'cancelled'];

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.phone.includes(searchTerm)
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
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <TrendingUp className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'shipped':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'delivered':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    setOrders(updatedOrders);
    console.log(`Updated order ${orderId} status to ${newStatus}`);
    
    toast({
      title: "Success",
      description: `Order status updated to ${newStatus}`,
    });
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and track fulfillment</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'All' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              {filteredOrders.length} order(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerInfo.fullName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerInfo.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, i) => (
                            <img
                              key={i}
                              src={item.image}
                              alt={item.name}
                              className="h-8 w-8 rounded-full border-2 border-background object-cover"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="h-16 w-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'All'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Orders will appear here once customers place them'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Complete order information and customer details
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedOrder.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(selectedOrder.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </div>
                  </Badge>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedOrder.customerInfo.fullName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedOrder.customerInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedOrder.customerInfo.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">City, Province</p>
                      <p className="font-medium">{selectedOrder.customerInfo.city}, {selectedOrder.customerInfo.province}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Delivery Address</p>
                      <p className="font-medium">{selectedOrder.customerInfo.address}</p>
                    </div>
                    {selectedOrder.customerInfo.note && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Note</p>
                        <p className="font-medium">{selectedOrder.customerInfo.note}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">{item.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Payment Method: {selectedOrder.paymentMethod}
                  </p>
                </div>

                {/* Quick Status Update */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      updateOrderStatus(selectedOrder.id, value);
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