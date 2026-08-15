import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Heart, ShoppingBag, Truck, ShieldCheck, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import './Dashboard.css';
import './ProductDetail.css';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [activeAccordion, setActiveAccordion] = React.useState<string>('details');
  const [addingId, setAddingId] = React.useState<number | null>(null);

  // Review states
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [rating, setRating] = React.useState<number>(5);
  const [comment, setComment] = React.useState('');

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await api.get(`/products/${slug}`);
      return response.data;
    },
    enabled: !!slug
  });

  const addToCart = useMutation({
    mutationFn: async (productId: number) => {
      setAddingId(productId);
      await api.post('/cart', { productId, quantity: 1 });
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAddingId(null);
    },
    onError: (err: any) => {
      setAddingId(null);
      alert(err?.response?.data?.message || 'Failed to add to cart.');
    }
  });

  const addReview = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error('Product not loaded');
      await api.post('/reviews', {
        productId: product.productId,
        rating,
        comment
      });
    },
    onSuccess: () => {
      setShowReviewModal(false);
      setRating(5);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
      alert('Review submitted successfully!');
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Failed to submit review.');
    }
  });

  const handleBuyNow = async () => {
    if (product) {
      await addToCart.mutateAsync(product.productId);
      navigate('/checkout');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart.mutate(product.productId, {
        onSuccess: () => openCart()
      });
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
          <Skeleton style={{ height: "600px" }} />
        </div>
      </PageWrapper>
    );
  }

  if (error || !product) {
    return (
      <PageWrapper>
        <div className="empty-state" style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <h2 className="text-display-2" style={{ fontFamily: 'var(--font-heading)' }}>Product Not Found</h2>
          <p className="text-body" style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>We couldn't find the product you're looking for.</p>
          <Button style={{ marginTop: '2rem' }} onClick={() => navigate('/shop')}>Back to Collection</Button>
        </div>
      </PageWrapper>
    );
  }

  const inWishlist = isInWishlist(product.productId);

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 var(--space-outer) 6rem', width: '100%' }}>
        <BackButton label="Back to Collection" />
        
        <div className="product-detail-layout">
          {/* Left: Image */}
          <div>
            <div className="product-gallery-desktop">
              {product.images?.length > 0 ? (
                product.images.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt={`${product.name} - view ${idx + 1}`} loading="lazy" />
                ))
              ) : (
                <div style={{ width: '100%', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-hover)' }}>
                  <ShoppingBag size={80} color="var(--text-muted)" opacity={0.2} strokeWidth={1} />
                </div>
              )}
            </div>
            
            <div className="product-gallery-mobile">
              {product.images?.length > 0 ? (
                product.images.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt={`${product.name} - view ${idx + 1}`} loading="lazy" />
                ))
              ) : (
                <div style={{ width: '100%', aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-hover)', flexShrink: 0 }}>
                  <ShoppingBag size={80} color="var(--text-muted)" opacity={0.2} strokeWidth={1} />
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-6) 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <span className="text-label" style={{ color: 'var(--text-secondary)', letterSpacing: '0.15em', fontSize: '11px' }}>{product.brandName}</span>
              {product.rating > 4.5 && <Badge variant="accent">Top Rated</Badge>}
            </div>
            
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '42px', fontWeight: 400, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', lineHeight: 1.2 }}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }} aria-label={`${product.rating} out of 5`}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} strokeWidth={1.5} fill={i <= Math.round(product.rating) ? 'var(--text-primary)' : 'none'} color={i <= Math.round(product.rating) ? 'var(--text-primary)' : 'var(--text-muted)'} />
                ))}
              </div>
              <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>({product.rating ?? 4.5} reviews)</span>
            </div>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: '24px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>₹{product.price.toLocaleString('en-IN')}</p>
            
            <p className="text-body-lg" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', lineHeight: 1.8 }}>
              {product.description}
            </p>

            <div className="desktop-actions" style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              <Button 
                size="lg" 
                style={{ flex: 1 }} 
                onClick={handleBuyNow}
                disabled={addingId === product.productId}
              >
                Buy Now
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                style={{ flex: 1 }} 
                onClick={handleAddToCart}
                loading={addingId === product.productId}
              >
                Add to Cart
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                style={{ padding: '0 var(--space-4)' }}
                onClick={() => toggleWishlist(product)}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={20} strokeWidth={1.5} fill={inWishlist ? 'var(--text-primary)' : 'none'} color="var(--text-primary)" />
              </Button>
            </div>

            {/* Accordions */}
            <div style={{ borderTop: '1px solid var(--border-general)', marginBottom: 'var(--space-8)' }}>
              <div className="accordion-item">
                <button className="accordion-header" onClick={() => setActiveAccordion(activeAccordion === 'details' ? '' : 'details')}>
                  Product Details
                  {activeAccordion === 'details' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {activeAccordion === 'details' && (
                  <div className="accordion-content">
                    {product.description}
                  </div>
                )}
              </div>
              <div className="accordion-item">
                <button className="accordion-header" onClick={() => setActiveAccordion(activeAccordion === 'ingredients' ? '' : 'ingredients')}>
                  Key Ingredients
                  {activeAccordion === 'ingredients' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {activeAccordion === 'ingredients' && (
                  <div className="accordion-content">
                    Formulated with clinical grade actives. Refer to packaging for full ingredient list.
                  </div>
                )}
              </div>
              <div className="accordion-item">
                <button className="accordion-header" onClick={() => setActiveAccordion(activeAccordion === 'how' ? '' : 'how')}>
                  How to Use
                  {activeAccordion === 'how' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {activeAccordion === 'how' && (
                  <div className="accordion-content">
                    Apply a small amount to clean, dry skin. Massage gently until fully absorbed. Use morning and night.
                  </div>
                )}
              </div>
            </div>

            {/* Features / Guarantees */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)', borderTop: '1px solid var(--border-general)', paddingTop: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Truck size={18} strokeWidth={1.5} color="var(--text-secondary)" />
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Complimentary shipping on orders over ₹1000</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <ShieldCheck size={18} strokeWidth={1.5} color="var(--text-secondary)" />
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>100% Authentic Products</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <RefreshCcw size={18} strokeWidth={1.5} color="var(--text-secondary)" />
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>14-day easy returns policy</span>
              </div>
            </div>

            {/* Write Review Section */}
            <div style={{ marginTop: 'var(--space-8)' }}>
              <Button variant="secondary" onClick={() => setShowReviewModal(true)}>
                Write a Review
              </Button>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ padding: 'var(--space-8)', maxWidth: '500px', width: '100%', background: 'var(--color-bg)', border: '1px solid var(--border-general)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>Write a Review</h2>
              
              <form onSubmit={e => { e.preventDefault(); addReview.mutate(); }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div>
                  <label className="text-body-sm" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={24}
                        strokeWidth={1}
                        fill={star <= rating ? 'var(--text-primary)' : 'none'}
                        color={star <= rating ? 'var(--text-primary)' : 'var(--text-secondary)'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-body-sm" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>Your Review</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your experience with this product..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border-general)', background: 'transparent', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', fontSize: '14px', fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                  <Button type="submit" variant="primary" disabled={addReview.isPending} style={{ flex: 1 }}>
                    {addReview.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowReviewModal(false)} style={{ flex: 1 }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Actions */}
      <div className="mobile-sticky-actions">
        <Button 
          style={{ flex: 1 }} 
          onClick={handleAddToCart}
          loading={addingId === product.productId}
        >
          Add to Cart - ₹{product.price.toLocaleString('en-IN')}
        </Button>
        <Button 
          variant="secondary" 
          style={{ padding: '0 var(--space-4)' }}
          onClick={() => toggleWishlist(product)}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={20} strokeWidth={1.5} fill={inWishlist ? 'var(--text-primary)' : 'none'} color="var(--text-primary)" />
        </Button>
      </div>
    </PageWrapper>
  );
};
