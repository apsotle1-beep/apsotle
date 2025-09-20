import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Send } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

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

interface ProductReview {
  product_id: number;
  rating: number;
  review_text: string;
}

const Review = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Record<number, ProductReview>>({});

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (error) {
          console.error('Error fetching order:', error);
          toast({
            title: "Error",
            description: "Could not find the order. Please check the link.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        if (data.status !== 'delivered') {
          toast({
            title: "Order Not Delivered",
            description: "You can only review orders that have been delivered.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        const orderData = data as any; // Type assertion since we know the structure
        setOrder(orderData as Order);

        // Initialize empty reviews for each product
        const initialReviews: Record<number, ProductReview> = {};
        (orderData.items as any[]).forEach((item: any) => {
          initialReviews[item.id] = {
            product_id: item.id,
            rating: 0,
            review_text: ''
          };
        });
        setReviews(initialReviews);

      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Error",
          description: "Failed to load order details.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate, toast]);

  const handleRatingChange = (productId: number, rating: number) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        rating
      }
    }));
  };

  const handleReviewTextChange = (productId: number, reviewText: string) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        review_text: reviewText
      }
    }));
  };

  const handleSubmitReviews = async () => {
    if (!order) return;

    // Validate that all products have at least a rating
    const incompleteReviews = Object.values(reviews).filter(review => review.rating === 0);
    if (incompleteReviews.length > 0) {
      toast({
        title: "Incomplete Reviews",
        description: "Please provide a rating for all products.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const reviewInserts = Object.values(reviews).map(review => ({
        order_id: order.order_id,
        product_id: review.product_id,
        customer_name: order.customer_info.fullName,
        customer_email: order.customer_info.email || null,
        rating: review.rating,
        review_text: review.review_text.trim() || null
      }));

      const { error } = await supabase
        .from('reviews')
        .insert(reviewInserts);

      if (error) {
        console.error('Error submitting reviews:', error);
        toast({
          title: "Error",
          description: "Failed to submit reviews. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Thank you for your reviews! They help us improve our products.",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error submitting reviews:', error);
      toast({
        title: "Error",
        description: "Failed to submit reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-2xl font-semibold mb-2">Loading Review...</h3>
            <p className="text-muted-foreground">Please wait while we load your order details</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">The order you're trying to review doesn't exist.</p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Review Your Order</h1>
          <p className="text-xl text-muted-foreground">Order #{order.order_id}</p>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Delivered on {new Date(order.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold">Share Your Experience</h2>

          {order.items.map((item, index) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(item.id, star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviews[item.id]?.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {reviews[item.id]?.rating > 0 && `${reviews[item.id].rating} star${reviews[item.id].rating > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">Review (Optional)</label>
                  <Textarea
                    placeholder="Share your thoughts about this product..."
                    value={reviews[item.id]?.review_text || ''}
                    onChange={(e) => handleReviewTextChange(item.id, e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button
              onClick={handleSubmitReviews}
              disabled={submitting}
              size="lg"
              className="px-8"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Reviews
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Review;
