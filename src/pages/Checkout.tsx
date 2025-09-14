import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, User, Mail, Phone, FileText, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  deliveryAddress: string;
  city: string;
  province: string;
  note: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, getTotalItems } = useCart();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    deliveryAddress: '',
    city: '',
    province: '',
    note: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return formData.fullName.trim() &&
           formData.phoneNumber.trim() &&
           formData.deliveryAddress.trim() &&
           formData.city.trim() &&
           formData.province.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Please fill in all required fields",
        description: "Make sure to complete all required information before placing your order.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate order processing
    try {
      // Log order details to console (as requested)
      const orderDetails = {
        customer: formData,
        items: items,
        total: total,
        orderDate: new Date().toISOString(),
        paymentMethod: 'Cash on Delivery (COD)',
        orderId: `ORD-${Date.now()}`,
      };
      
      console.log('=== ORDER DETAILS ===');
      console.log('Order ID:', orderDetails.orderId);
      console.log('Customer Info:', orderDetails.customer);
      console.log('Items:', orderDetails.items);
      console.log('Total Amount:', `$${orderDetails.total.toFixed(2)}`);
      console.log('Payment Method:', orderDetails.paymentMethod);
      console.log('Order Date:', orderDetails.orderDate);
      console.log('====================');

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and navigate to confirmation
      clearCart();
      navigate('/order-confirmation', { 
        state: { orderDetails }
      });
      
    } catch (error) {
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your order with cash on delivery payment
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Contact Information */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Contact Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your phone number"
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Delivery Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                    <Input
                      id="deliveryAddress"
                      name="deliveryAddress"
                      type="text"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your complete delivery address"
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your city"
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="province">Province *</Label>
                      <Input
                        id="province"
                        name="province"
                        type="text"
                        value={formData.province}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your province"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="note">Special Instructions (Optional)</Label>
                    <Textarea
                      id="note"
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Any special delivery instructions..."
                      className="mt-2 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-6">
                  <Banknote className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Payment Method</h2>
                </div>
                
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Cash on Delivery (COD)</h3>
                      <p className="text-muted-foreground">
                        Pay when you receive your order – No advance payment required
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold mb-2">How it works:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Your order will be processed immediately</li>
                      <li>• We'll deliver to your specified address</li>
                      <li>• Pay the delivery person when you receive your items</li>
                      <li>• Inspect your order before payment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.form>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-card rounded-2xl p-6 shadow-sm border sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-2">{item.name}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <hr className="border-border mb-4" />
              
              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[hsl(var(--price))]">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full btn-cart text-lg py-6"
                disabled={!isFormValid() || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>Place Order - ${total.toFixed(2)}</>
                )}
              </Button>

              <div className="mt-4 text-xs text-muted-foreground text-center">
                By placing your order, you agree to our terms and conditions
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;