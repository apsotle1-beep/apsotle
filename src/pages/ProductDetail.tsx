import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Review = Tables<'reviews'>;

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Create media items array for the gallery
  const getMediaItems = useCallback(() => {
    if (!product) return [];
    
    const mediaItems = [];
    
    // Add main image
    if (product.image) {
      mediaItems.push({
        type: 'image',
        url: product.image,
        alt: product.name
      });
    }
    
    // Add additional images
    if (product.images && product.images.length > 1) {
      product.images.slice(1).forEach((image, index) => {
        mediaItems.push({
          type: 'image',
          url: image,
          alt: `${product.name} - Image ${index + 2}`
        });
      });
    }
    
    // Add video
    if (product.video) {
      mediaItems.push({
        type: 'video',
        url: product.video,
        alt: `${product.name} - Video`
      });
    }
    
    return mediaItems;
  }, [product]);

  const mediaItems = getMediaItems();

  // Function to pause all videos
  const pauseAllVideos = useCallback(() => {
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
      if (!video.paused) {
        try {
          video.pause();
        } catch (error) {
          console.warn('Error pausing video:', error);
        }
      }
    });
    setIsVideoPlaying(false);
  }, []);

  const nextSlide = useCallback(() => {
    if (mediaItems.length === 0) return;
    pauseAllVideos();
    setCurrentSlide((prev) => (prev + 1) % mediaItems.length);
    setVideoError(null);
  }, [mediaItems.length, pauseAllVideos]);

  const prevSlide = useCallback(() => {
    if (mediaItems.length === 0) return;
    pauseAllVideos();
    setCurrentSlide((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    setVideoError(null);
  }, [mediaItems.length, pauseAllVideos]);

  const goToSlide = useCallback((index: number) => {
    pauseAllVideos();
    setCurrentSlide(index);
    setVideoError(null);
  }, [pauseAllVideos]);

  // Video control functions
  const handleVideoClick = useCallback((e: React.MouseEvent<HTMLVideoElement>) => {
    e.stopPropagation();
    const video = e.currentTarget;
    
    // Don't handle click if it's on the controls
    if (e.target !== video) return;
    
    // Pause any other videos first with a small delay
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(v => {
      if (v !== video && !v.paused) {
        v.pause();
      }
    });
    
    // Use a small timeout to prevent conflicts
    setTimeout(() => {
      if (video.paused) {
        video.play().catch((error) => {
          console.error('Error playing video:', error);
          setVideoError('Failed to play video');
        });
      } else {
        video.pause();
      }
    }, 50);
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        navigate('/products');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', Number(id))
          .single();

        if (error) {
          console.error('Error fetching product:', error);
          navigate('/products');
        } else if (data) {
          setProduct(data);
          setCurrentSlide(0); // Reset slide when product changes
          // Fetch reviews for this product
          fetchReviews(Number(id));
        } else {
          navigate('/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Fetch reviews for the product
  const fetchReviews = async (productId: number) => {
    try {
      setReviewsLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
      } else {
        setReviews(data || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Render star rating
  const renderStars = (rating: number, size: string = 'w-5 h-5') => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`${size} ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`} 
          />
        ))}
      </div>
    );
  };

  // Ensure current slide is within bounds
  useEffect(() => {
    if (mediaItems.length > 0 && currentSlide >= mediaItems.length) {
      setCurrentSlide(0);
    }
  }, [mediaItems.length, currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!product || mediaItems.length <= 1) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextSlide();
          break;
        case ' ':
          event.preventDefault();
          if (mediaItems[currentSlide]?.type === 'video') {
            const video = document.querySelector('video');
            if (video) {
              if (video.paused) {
                video.play().catch((error) => {
                  console.error('Error playing video:', error);
                  setVideoError('Failed to play video');
                });
              } else {
                video.pause();
              }
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, mediaItems, product, prevSlide, nextSlide]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-2xl font-semibold mb-2">Loading Product...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the product details</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-semibold mb-2">Product Not Found</h3>
            <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/products">Back to Products</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast({
      title: "Added to cart!",
      description: `${quantity} x ${product.name} added to your cart.`,
      duration: 2000,
    });
  };

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || mediaItems.length <= 1) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  const features = [
    { icon: Truck, text: "Free shipping on orders over $50" },
    { icon: Shield, text: "2-year warranty included" },
    { icon: RotateCcw, text: "30-day return policy" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link 
            to="/products" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Media Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="sticky top-24">
              {/* Main Gallery */}
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-muted">
                {/* Category Badge */}
                <div className="absolute top-6 left-6 z-10">
                  <span className="bg-background/90 backdrop-blur-sm text-foreground px-4 py-2 rounded-full font-medium">
                    {product.category}
                  </span>
                </div>

                {/* Media Counter */}
                {mediaItems.length > 1 && (
                  <div className="absolute top-6 right-6 z-10">
                    <span className="bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {currentSlide + 1} / {mediaItems.length}
                    </span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground p-2 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground p-2 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Media Display */}
                <div 
                  className="relative w-full aspect-square"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <AnimatePresence mode="wait">
                    {mediaItems.map((item, index) => (
                      index === currentSlide && (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 w-full h-full"
                        >
                          {item.type === 'image' ? (
                            <img
                              src={item.url}
                              alt={item.alt}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="relative w-full h-full bg-black">
                              <video
                                key={item.url}
                                className="w-full h-full object-cover"
                                poster={product.image}
                                controls
                                preload="metadata"
                                onPlay={(e) => {
                                  setIsVideoPlaying(true);
                                  setVideoError(null);
                                  // Pause other videos when this one starts playing
                                  const allVideos = document.querySelectorAll('video');
                                  allVideos.forEach(v => {
                                    if (v !== e.currentTarget && !v.paused) {
                                      v.pause();
                                    }
                                  });
                                }}
                                onPause={() => setIsVideoPlaying(false)}
                                onEnded={() => setIsVideoPlaying(false)}
                                onError={(e) => {
                                  console.error('Video error:', e);
                                  const video = e.currentTarget;
                                  if (video.error) {
                                    switch (video.error.code) {
                                      case video.error.MEDIA_ERR_ABORTED:
                                        setVideoError('Video playback was aborted');
                                        break;
                                      case video.error.MEDIA_ERR_NETWORK:
                                        setVideoError('Network error while loading video');
                                        break;
                                      case video.error.MEDIA_ERR_DECODE:
                                        setVideoError('Video format not supported');
                                        break;
                                      case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                        setVideoError('Video format not supported');
                                        break;
                                      default:
                                        setVideoError('Failed to load video');
                                    }
                                  } else {
                                    setVideoError('Failed to load video');
                                  }
                                  setIsVideoPlaying(false);
                                }}
                                onLoadStart={() => setVideoError(null)}
                                onCanPlay={() => setVideoError(null)}
                              >
                                <source src={item.url} type="video/mp4" />
                                <source src={item.url} type="video/webm" />
                                <source src={item.url} type="video/ogg" />
                                Your browser does not support the video tag.
                              </video>
                              {/* Video Play Overlay - Only show when video is paused and not hovering over controls */}
                              {!isVideoPlaying && !videoError && (
                                <div 
                                  className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none"
                                  style={{ zIndex: 1 }}
                                >
                                  <div className="bg-background/90 backdrop-blur-sm text-foreground p-4 rounded-full shadow-lg">
                                    <Play className="w-8 h-8" />
                                  </div>
                                </div>
                              )}
                              
                              {/* Video Error Message */}
                              {videoError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-none">
                                  <div className="bg-background/90 backdrop-blur-sm text-foreground p-4 rounded-lg shadow-lg text-center">
                                    <div className="text-destructive mb-2">⚠️</div>
                                    <div className="text-sm">{videoError}</div>
                                    <button 
                                      className="mt-2 text-xs text-primary hover:underline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setVideoError(null);
                                        const video = e.currentTarget.closest('.relative')?.querySelector('video');
                                        if (video) {
                                          video.load();
                                          // Try to play after loading
                                          setTimeout(() => {
                                            video.play().catch((error) => {
                                              console.error('Error playing video after retry:', error);
                                              setVideoError('Failed to play video');
                                            });
                                          }, 100);
                                        }
                                      }}
                                    >
                                      Retry
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {mediaItems.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {mediaItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentSlide
                          ? 'border-primary shadow-lg scale-105'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.alt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-muted flex items-center justify-center group">
                          <Play className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          <div className="absolute bottom-1 right-1 bg-background/90 text-xs px-1 rounded">
                            📹
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Dots Navigation */}
              {mediaItems.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {mediaItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? 'bg-primary scale-125'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                {renderStars(averageRating)}
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  {averageRating > 0 && ` - ${averageRating.toFixed(1)} stars`}
                </span>
              </div>

              <div className="price text-3xl mb-6">
                ${product.price.toFixed(2)}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xl font-semibold mb-3">What's Included</h3>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-success" />
                    <span className="text-muted-foreground">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="font-medium">
                  Quantity:
                </label>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-accent transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-l border-r border-border min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-accent transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full btn-cart text-lg py-6"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
              </motion.div>

              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                {features.map((feature, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <feature.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
            
            {reviewsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading reviews...</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {/* Reviews Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {renderStars(averageRating, 'w-6 h-6')}
                        <div>
                          <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">
                            Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      {/* Rating Distribution */}
                      <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = reviews.filter(r => r.rating === rating).length;
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={rating} className="flex items-center gap-2 text-sm">
                              <span className="w-3">{rating}</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-yellow-400 transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-8 text-muted-foreground">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold">{review.customer_name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(review.rating, 'w-4 h-4')}
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.created_at || '').toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {review.review_text && (
                            <p className="text-muted-foreground leading-relaxed">
                              {review.review_text}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to review this product when you purchase it!
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </section>

        {/* Related Products Section */}
        <section className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-8">You Might Also Like</h2>
            <div className="text-center py-12 bg-muted rounded-2xl">
              <p className="text-muted-foreground">
                Related products feature coming soon...
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
};

export default ProductDetail;