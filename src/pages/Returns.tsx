import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Calendar, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Returns = () => {
  const returnSteps = [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Contact our customer service or use your account to start a return request.',
      icon: AlertCircle
    },
    {
      step: 2,
      title: 'Get Return Label',
      description: 'We\'ll email you a prepaid return shipping label within 24 hours.',
      icon: Package
    },
    {
      step: 3,
      title: 'Pack & Ship',
      description: 'Pack your item securely and attach the return label to the package.',
      icon: RotateCcw
    },
    {
      step: 4,
      title: 'Processing',
      description: 'Once we receive your return, we\'ll process your refund within 3-5 business days.',
      icon: CheckCircle
    }
  ];

  const returnableItems = [
    {
      category: 'Electronics',
      timeframe: '30 days',
      condition: 'Original packaging required',
      status: 'returnable',
      notes: 'Must be in working condition with all accessories'
    },
    {
      category: 'Clothing',
      timeframe: '60 days',
      condition: 'Unworn with tags',
      status: 'returnable',
      notes: 'Must be in original condition'
    },
    {
      category: 'Home Goods',
      timeframe: '45 days',
      condition: 'Unused condition',
      status: 'returnable',
      notes: 'Original packaging preferred'
    },
    {
      category: 'Accessories',
      timeframe: '30 days',
      condition: 'Unused with packaging',
      status: 'returnable',
      notes: 'Must include all original components'
    }
  ];

  const nonReturnableItems = [
    'Personalized or customized items',
    'Perishable goods',
    'Digital downloads',
    'Gift cards',
    'Items damaged by misuse',
    'Items without original packaging (electronics)'
  ];

  const refundMethods = [
    {
      method: 'Original Payment Method',
      timeframe: '3-5 business days',
      description: 'Refund will be processed to your original payment method'
    },
    {
      method: 'Store Credit',
      timeframe: 'Immediate',
      description: 'Get instant store credit for faster future purchases'
    },
    {
      method: 'Exchange',
      timeframe: '2-3 business days',
      description: 'Exchange for a different size, color, or similar item'
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
              Returns & Refunds
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We want you to be completely satisfied with your purchase. Here's everything you need to know about our return policy.
            </p>
          </motion.div>

          {/* Return Process */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">How to Return an Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {returnSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="outline" className="w-fit mx-auto mb-2">
                        Step {step.step}
                      </Badge>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Return Policy by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Return Policy by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {returnableItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.category}</CardTitle>
                        <Badge variant="secondary" className="text-green-600 bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Returnable
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Return window: <strong>{item.timeframe}</strong></span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Condition:</p>
                        <p className="text-sm">{item.condition}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Notes:</p>
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Non-Returnable Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Non-Returnable Items</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <CardTitle>Items That Cannot Be Returned</CardTitle>
                </div>
                <CardDescription>
                  For hygiene, safety, and quality reasons, the following items cannot be returned:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {nonReturnableItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Refund Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Refund Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {refundMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{method.method}</CardTitle>
                      <Badge variant="outline">{method.timeframe}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm text-center">{method.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact for Returns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <RotateCcw className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Need to Start a Return?</h3>
                <p className="text-muted-foreground mb-6">
                  Our customer service team is ready to help you with your return. Contact us to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg">
                    Start Return Request
                  </Button>
                  <Button variant="outline" size="lg">
                    Contact Support
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Email: <span className="font-medium text-primary">returns@apsotle.com</span> | 
                  Phone: <span className="font-medium text-primary">+1 (555) 123-4567</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Returns;
