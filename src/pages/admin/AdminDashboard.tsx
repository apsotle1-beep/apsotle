import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { testEmailFunctionality } from '@/utils/emailTest';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  recentOrders: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: productsData, error: productsError } = await supabase.from('products').select('*');
      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*');

      if (productsError || ordersError) {
        console.error(productsError || ordersError);
        return;
      }

      const totalProducts = productsData.length;
      const totalOrders = ordersData.length;
      const pendingOrders = ordersData.filter(order => order.status === 'pending').length;
      const deliveredOrders = ordersData.filter(order => order.status === 'delivered').length;
      const totalRevenue = ordersData
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.total, 0);
      const recentOrders = ordersData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setStats({
        totalProducts,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
        recentOrders
      });
    };

    fetchStats();
  }, []);

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

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-primary bg-primary/10',
      description: 'Active products in store'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-secondary bg-secondary/10',
      description: 'All time orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-warning bg-warning/10',
      description: 'Orders awaiting processing'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-success bg-success/10',
      description: 'Total earnings (excluding cancelled)'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{order.order_id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_info?.fullName || 'Unknown Customer'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {stats.recentOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-warning" />
                      Pending
                    </span>
                    <span className="font-medium">{stats.pendingOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Shipped
                    </span>
                    <span className="font-medium">
                      {stats.totalOrders - stats.pendingOrders - stats.deliveredOrders - stats.recentOrders.filter(order => order.status === 'cancelled').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Delivered
                    </span>
                    <span className="font-medium">{stats.deliveredOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      Cancelled
                    </span>
                    <span className="font-medium">
                      {stats.recentOrders.filter(order => order.status === 'cancelled').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Manage your store efficiently with these quick links:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/admin/products" className="p-3 text-left rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Package className="h-4 w-4 mb-1" />
                      <p className="text-sm font-medium">Add Product</p>
                    </Link>
                    <Link to="/admin/orders" className="p-3 text-left rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                      <ShoppingCart className="h-4 w-4 mb-1" />
                      <p className="text-sm font-medium">View Orders</p>
                    </Link>
                    <Link to="/admin/customers" className="p-3 text-left rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Users className="h-4 w-4 mb-1" />
                      <p className="text-sm font-medium">Customers</p>
                    </Link>  
                    <Link to="/admin/analytics" className="p-3 text-left rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                      <TrendingUp className="h-4 w-4 mb-1" />
                      <p className="text-sm font-medium">Analytics</p>
                    </Link>
                  </div>
                  
                  {/* Email Test Section */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium mb-3">Email Testing</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Test the order confirmation email functionality
                    </p>
                    <Button 
                      onClick={testEmailFunctionality}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Test Email Functionality
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Check browser console for email simulation details
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
