import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Package, Shield, Globe } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ShippingInfo = () => {
  const shippingOptions = [
    {
      icon: Truck,
      title: 'Standard Shipping',
      time: '5-7 Business Days',
      cost: 'Free on orders over $50',
      description: 'Our most popular shipping option with reliable delivery times.'
    },
    {
      icon: Clock,
      title: 'Express Shipping',
      time: '2-3 Business Days',
      cost: '$9.99',
      description: 'Faster delivery for when you need your items quickly.'
    },
    {
      icon: Package,
      title: 'Overnight Shipping',
      time: '1 Business Day',
      cost: '$19.99',
      description: 'Next-day delivery for urgent orders placed before 2 PM.'
    }
  ];

  const shippingZones = [
    {
      zone: 'Domestic (US)',
      countries: ['United States'],
      timeframe: '2-7 business days',
      cost: 'Free over $50, otherwise $5.99'
    },
    {
      zone: 'North America',
      countries: ['Canada', 'Mexico'],
      timeframe: '7-14 business days',
      cost: 'Starting at $12.99'
    },
    {
      zone: 'International',
      countries: ['Europe', 'Asia', 'Australia', 'Others'],
      timeframe: '10-21 business days',
      cost: 'Starting at $19.99'
    }
  ];

  const policies = [
    {
      title: 'Processing Time',
      description: 'Orders are processed within 1-2 business days. Orders placed on weekends or holidays will be processed the next business day.'
    },
    {
      title: 'Shipping Confirmation',
      description: 'You\'ll receive a shipping confirmation email with tracking information once your order ships.'
    },
    {
      title: 'Delivery Attempts',
      description: 'If delivery fails, the carrier will make up to 3 attempts. After that, the package will be returned to our facility.'
    },
    {
      title: 'Address Accuracy',
      description: 'Please ensure your shipping address is correct. We are not responsible for packages sent to incorrect addresses.'
    },
    {
      title: 'Damaged Packages',
      description: 'If your package arrives damaged, please contact us within 48 hours with photos for a quick resolution.'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Shipping Information
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Fast, reliable shipping options to get your products delivered safely and on time.
            </p>
          </motion.div>

          {/* Shipping Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Shipping Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shippingOptions.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                        <option.icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle>{option.title}</CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-sm">
                          {option.time}
                        </Badge>
                        <p className="font-semibold text-primary">{option.cost}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Shipping Zones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Shipping Zones</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {shippingZones.map((zone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{zone.zone}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Countries:</p>
                        <p className="text-sm">{zone.countries.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Delivery Time:</p>
                        <p className="text-sm">{zone.timeframe}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Shipping Cost:</p>
                        <p className="text-sm font-semibold text-primary">{zone.cost}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Shipping Policies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6">Shipping Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {policies.map((policy, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{policy.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{policy.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Need Help with Shipping?</h3>
                <p className="text-muted-foreground mb-4">
                  Have questions about shipping options or need to track your order? Our customer service team is here to help.
                </p>
                <p className="text-sm text-muted-foreground">
                  Contact us at <span className="font-medium text-primary">support@apsotle.com</span> or call <span className="font-medium text-primary">+1 (555) 123-4567</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingInfo;
