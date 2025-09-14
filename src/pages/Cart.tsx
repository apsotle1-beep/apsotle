import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const { items, total, updateQuantity, removeItem, getTotalItems } = useCart();
  const { toast } = useToast();

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
        duration: 2000,
      });
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: number, name: string) => {
    removeItem(id);
    toast({
      title: "Item removed",
      description: `${name} has been removed from your cart.`,
      duration: 2000,
    });
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>
            <Button asChild size="lg" className="btn-hero">
              <Link to="/products">
                Start Shopping <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
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
          <h1 className="text-4xl font-bold mb-4">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-sm border"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link to={`/product/${item.id}`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-xl hover:opacity-80 transition-opacity"
                        />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <Link 
                            to={`/product/${item.id}`}
                            className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                          <span className="inline-block bg-muted px-3 py-1 rounded-full text-sm font-medium mt-2">
                            {item.category}
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-4">
                          <div className="price-small">
                            ${item.price.toFixed(2)}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-border rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-accent transition-colors rounded-l-lg"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 border-l border-r border-border min-w-[60px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-accent transition-colors rounded-r-lg"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id, item.name)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Subtotal</div>
                            <div className="price-small">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <hr className="border-border" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[hsl(var(--price))]">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full btn-cart text-lg py-6 mb-4">
                <Link to="/checkout">
                  Proceed to Checkout <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link to="/products">Continue Shopping</Link>
              </Button>

              {/* Features */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Secure checkout process</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;