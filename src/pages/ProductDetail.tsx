import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Product, useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 fill-yellow-400 text-yellow-400" 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(128 reviews)</span>
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