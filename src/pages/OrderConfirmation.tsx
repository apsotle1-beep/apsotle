import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, Phone, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const OrderConfirmation = () => {
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;

  // Redirect if no order details
  if (!orderDetails) {
    return <Navigate to="/" replace />;
  }

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Thank you for your order. We've received your order and will deliver it to your address. 
              You'll pay cash on delivery when your items arrive.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-card rounded-2xl p-6 shadow-sm border"
              >
                <h2 className="text-2xl font-bold mb-4">Order Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order ID:</span>
                    <div className="font-mono font-medium">{orderDetails.orderId}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order Date:</span>
                    <div>{new Date(orderDetails.orderDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Method:</span>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      Cash on Delivery (COD)
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Amount:</span>
                    <div className="text-lg font-bold text-[hsl(var(--price))]">
                      ${orderDetails.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Delivery Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-card rounded-2xl p-6 shadow-sm border"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Delivery Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Address
                    </h3>
                    <div className="text-muted-foreground space-y-1">
                      <div>{orderDetails.customer.fullName}</div>
                      <div>{orderDetails.customer.deliveryAddress}</div>
                      <div>{orderDetails.customer.city}, {orderDetails.customer.province}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Information
                    </h3>
                    <div className="text-muted-foreground space-y-1">
                      <div>{orderDetails.customer.phoneNumber}</div>
                      {orderDetails.customer.email && (
                        <div>{orderDetails.customer.email}</div>
                      )}
                    </div>
                  </div>
                </div>

                {orderDetails.customer.note && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Special Instructions:</h4>
                    <p className="text-muted-foreground">{orderDetails.customer.note}</p>
                  </div>
                )}
              </motion.div>

              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-card rounded-2xl p-6 shadow-sm border"
              >
                <h2 className="text-2xl font-bold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {orderDetails.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-muted rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm">Quantity: {item.quantity}</span>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Delivery Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="lg:col-span-1"
            >
              <div className="bg-card rounded-2xl p-6 shadow-sm border sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Delivery Timeline</h2>
                
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Order Confirmed</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Processing */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Processing</div>
                      <div className="text-sm text-muted-foreground">
                        Within 24 hours
                      </div>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border-2 border-muted rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-muted-foreground">Out for Delivery</div>
                      <div className="text-sm text-muted-foreground">
                        Expected: {deliveryDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Estimated Delivery</span>
                  </div>
                  <div className="text-lg font-bold">
                    {deliveryDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/products">Continue Shopping</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/">Back to Home</Link>
                  </Button>
                </div>

                <div className="mt-6 p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2">Need Help?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    If you have any questions about your order, please contact our customer service team.
                  </p>
                  <div className="text-sm">
                    <div>📞 Customer Support</div>
                    <div className="text-muted-foreground">Available 24/7</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;