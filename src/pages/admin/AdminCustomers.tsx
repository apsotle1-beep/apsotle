import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  ShoppingCart,
  Calendar
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ordersData from '@/data/orders.json';

interface Customer {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  province: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'active' | 'inactive';
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Process orders to create customer data
  useEffect(() => {
    const customerMap = new Map<string, Customer>();

    ordersData.forEach(order => {
      const key = `${order.customerInfo.fullName}-${order.customerInfo.phone}`;
      
      if (customerMap.has(key)) {
        const customer = customerMap.get(key)!;
        customer.totalOrders += 1;
        customer.totalSpent += order.status !== 'cancelled' ? order.total : 0;
        
        // Update last order date if this order is more recent
        if (new Date(order.orderDate) > new Date(customer.lastOrderDate)) {
          customer.lastOrderDate = order.orderDate;
        }
      } else {
        customerMap.set(key, {
          fullName: order.customerInfo.fullName,
          phone: order.customerInfo.phone,
          email: order.customerInfo.email || '',
          city: order.customerInfo.city,
          province: order.customerInfo.province,
          totalOrders: 1,
          totalSpent: order.status !== 'cancelled' ? order.total : 0,
          lastOrderDate: order.orderDate,
          status: 'active'
        });
      }
    });

    // Convert map to array and mark inactive customers (no orders in last 30 days)
    const customersArray = Array.from(customerMap.values()).map(customer => {
      const daysSinceLastOrder = Math.floor(
        (new Date().getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        ...customer,
        status: daysSinceLastOrder > 30 ? 'inactive' as const : 'active' as const
      };
    });

    // Sort by total spent (descending)
    customersArray.sort((a, b) => b.totalSpent - a.totalSpent);

    setCustomers(customersArray);
    setFilteredCustomers(customersArray);
  }, []);

  // Filter customers based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer =>
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageOrderValue: customers.length > 0 
      ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 0)
      : 0
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage and view customer information</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeCustomers} active
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <Users className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <ShoppingCart className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  From all customers
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                <Calendar className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Per order
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, phone, email, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
            <CardDescription>
              {filteredCustomers.length} customer(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer, index) => (
                    <motion.tr
                      key={`${customer.fullName}-${customer.phone}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {customer.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{customer.fullName}</p>
                            <p className="text-sm text-muted-foreground">Customer</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {customer.city}, {customer.province}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{customer.totalOrders}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-success">
                        ${customer.totalSpent.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={customer.status === 'active' 
                            ? 'bg-success/10 text-success border-success/20' 
                            : 'bg-muted/10 text-muted-foreground border-muted/20'
                          }
                        >
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <div className="h-16 w-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? 'Try adjusting your search criteria'
                    : 'Customers will appear here once they place orders'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;