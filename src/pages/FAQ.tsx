import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, HelpCircle, ShoppingCart, Truck, RotateCcw, CreditCard, Shield } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  icon: React.ElementType;
}

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    // Orders & Shopping
    {
      id: 1,
      question: 'How do I place an order?',
      answer: 'Simply browse our products, add items to your cart, and proceed to checkout. You can create an account or checkout as a guest. Follow the prompts to enter your shipping and payment information.',
      category: 'Orders',
      icon: ShoppingCart
    },
    {
      id: 2,
      question: 'Can I modify or cancel my order after placing it?',
      answer: 'You can modify or cancel your order within 1 hour of placing it by contacting our customer service. After this window, we may have already started processing your order.',
      category: 'Orders',
      icon: ShoppingCart
    },
    {
      id: 3,
      question: 'Do you offer bulk discounts?',
      answer: 'Yes! We offer bulk discounts for orders over certain quantities. Contact our sales team at sales@apsotle.com for custom pricing on large orders.',
      category: 'Orders',
      icon: ShoppingCart
    },

    // Shipping
    {
      id: 4,
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days, Express shipping takes 2-3 business days, and Overnight shipping takes 1 business day. Processing time is 1-2 business days.',
      category: 'Shipping',
      icon: Truck
    },
    {
      id: 5,
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries worldwide. International shipping takes 10-21 business days and starts at $19.99. Customs fees may apply and are the responsibility of the customer.',
      category: 'Shipping',
      icon: Truck
    },
    {
      id: 6,
      question: 'How can I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order by logging into your account and viewing your order history.',
      category: 'Shipping',
      icon: Truck
    },
    {
      id: 7,
      question: 'What if my package is lost or damaged?',
      answer: 'If your package is lost or arrives damaged, please contact us within 48 hours with photos (for damaged items). We\'ll work with the carrier to resolve the issue and send a replacement.',
      category: 'Shipping',
      icon: Truck
    },

    // Returns & Refunds
    {
      id: 8,
      question: 'What is your return policy?',
      answer: 'We offer returns within 30-60 days depending on the product category. Items must be in original condition with packaging. Electronics require original packaging and all accessories.',
      category: 'Returns',
      icon: RotateCcw
    },
    {
      id: 9,
      question: 'How do I return an item?',
      answer: 'Contact our customer service to initiate a return. We\'ll email you a prepaid return label. Pack the item securely and ship it back to us. Refunds are processed within 3-5 business days after we receive the return.',
      category: 'Returns',
      icon: RotateCcw
    },
    {
      id: 10,
      question: 'Can I exchange an item instead of returning it?',
      answer: 'Yes! You can exchange items for a different size, color, or similar product. Contact customer service to arrange an exchange. The process typically takes 2-3 business days.',
      category: 'Returns',
      icon: RotateCcw
    },

    // Payment
    {
      id: 11,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and bank transfers for large orders.',
      category: 'Payment',
      icon: CreditCard
    },
    {
      id: 12,
      question: 'Is my payment information secure?',
      answer: 'Absolutely! We use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers.',
      category: 'Payment',
      icon: Shield
    },
    {
      id: 13,
      question: 'When will I be charged for my order?',
      answer: 'Your payment method will be charged immediately when you place your order. For pre-orders, you\'ll be charged when the item ships.',
      category: 'Payment',
      icon: CreditCard
    },

    // Account & General
    {
      id: 14,
      question: 'Do I need to create an account to shop?',
      answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, view order history, and receive exclusive offers.',
      category: 'Account',
      icon: HelpCircle
    },
    {
      id: 15,
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page and enter your email address. We\'ll send you a link to reset your password. If you don\'t receive the email, check your spam folder.',
      category: 'Account',
      icon: HelpCircle
    },
    {
      id: 16,
      question: 'Do you offer price matching?',
      answer: 'We offer price matching on identical items from authorized retailers. Contact us with the competitor\'s price and we\'ll match it if it meets our price matching criteria.',
      category: 'General',
      icon: HelpCircle
    },
    {
      id: 17,
      question: 'Are your products authentic?',
      answer: 'Yes, all our products are 100% authentic and sourced directly from manufacturers or authorized distributors. We guarantee the authenticity of every item we sell.',
      category: 'General',
      icon: Shield
    },
    {
      id: 18,
      question: 'Do you offer warranties on products?',
      answer: 'Many of our products come with manufacturer warranties. We also offer extended warranty options for electronics. Warranty details are listed on each product page.',
      category: 'General',
      icon: Shield
    }
  ];

  const categories = ['All', 'Orders', 'Shipping', 'Returns', 'Payment', 'Account', 'General'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Orders': return ShoppingCart;
      case 'Shipping': return Truck;
      case 'Returns': return RotateCcw;
      case 'Payment': return CreditCard;
      case 'Account': return HelpCircle;
      case 'General': return Shield;
      default: return HelpCircle;
    }
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

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
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about shopping, shipping, returns, and more.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search FAQs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const IconComponent = getCategoryIcon(category);
                      return (
                        <Badge
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <IconComponent className="h-3 w-3 mr-1" />
                          {category}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No FAQs Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or category filter.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFAQs.map((faq, index) => {
                const isExpanded = expandedItems.includes(faq.id);
                const IconComponent = faq.icon;
                
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleExpanded(faq.id)}
                          className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <IconComponent className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-left">{faq.question}</h3>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {faq.category}
                                </Badge>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-6 pb-6"
                          >
                            <div className="pl-12 border-l-2 border-primary/20">
                              <p className="text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Still Have Questions?</h3>
                <p className="text-muted-foreground mb-4">
                  Can't find what you're looking for? Our customer support team is here to help.
                </p>
                <p className="text-sm text-muted-foreground">
                  Email: <span className="font-medium text-primary">support@apsotle.com</span> | 
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

export default FAQ;
