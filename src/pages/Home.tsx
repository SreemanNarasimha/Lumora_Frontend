import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag, Heart, Eye, Star, ChevronRight,
  FlaskConical, Sun, Droplets, Shield,
  Microscope, Leaf, Zap, Award, ArrowRight, ChevronLeft
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Footer } from '../components/layout/Footer';
import { Skeleton } from '../components/ui/Skeleton';
import { PageWrapper } from '../components/layout/PageWrapper';
import { EditorialBanner } from '../components/ui/EditorialBanner';
import { useWishlist } from '../context/WishlistContext';
import api from '../api/axios';
import heroImage from '../assets/hero.png';
import './Home.css';

interface Product {
  productId: number;
  name: string;
  price: number;
  rating: number;
  categoryName: string;
  brandName: string;
  images: string[];
  description: string;
  slug: string;
}

const CATEGORIES = [
  { id: '1', label: 'Cleansers', icon: Droplets, color: '#8A9A86' },
  { id: '4', label: 'Serums',    icon: FlaskConical, color: '#B3A394' },
  { id: '6', label: 'Moisturizers', icon: Shield, color: '#C28E75' },
  { id: '7', label: 'Sunscreens', icon: Sun, color: '#8A9A86' },
];

const INGREDIENTS = [
  { name: 'Niacinamide', benefit: 'Brightens & minimises pores', icon: Microscope },
  { name: 'Vitamin C',   benefit: 'Antioxidant glow booster', icon: Sun },
  { name: 'Retinol',     benefit: 'Anti-ageing cell renewal', icon: Zap },
  { name: 'Ceramides',   benefit: 'Barrier repair & hydration', icon: Shield },
];

const TRUST_BADGES = [
  { icon: Microscope, label: 'Dermatologist Tested' },
  { icon: Leaf,       label: 'Cruelty Free' },
  { icon: Shield,     label: 'Paraben Free' },
  { icon: Award,      label: 'Premium Ingredients' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', rating: 5, text: 'My skin has never looked better. The serum is absolutely transformative — I saw visible results in two weeks.', label: 'Verified Purchase' },
  { name: 'Meera K.', rating: 5, text: 'Lumora\'s moisturizer is a game changer. Lightweight, hydrating, and it doesn\'t break me out.', label: 'Verified Purchase' },
  { name: 'Ananya R.', rating: 5, text: 'Finally found a sunscreen I actually enjoy wearing. Zero white cast and feels like a luxury product.', label: 'Verified Purchase' },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="star-rating" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={14} fill={i <= rating ? '#8A9A86' : 'none'} color={i <= rating ? '#8A9A86' : '#9A96A8'} />
    ))}
  </div>
);

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const { data, isLoading } = useQuery({
    queryKey: ['products-home'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data;
    },
    retry: false,
  });

  const products: Product[] = data?.content ?? [];
  const bestSellers = products.slice(0, 8);
  const newArrivals = products.slice(4, 12);

  const totalSlides = Math.max(1, Math.ceil(newArrivals.length / 4));
  const prevSlide = () => setCarouselIdx(i => Math.max(0, i - 1));
  const nextSlide = () => setCarouselIdx(i => Math.min(totalSlides - 1, i + 1));

  return (
    <PageWrapper showHeader={false}>
      {/* ═══════════ HERO ═══════════ */}
      <section 
        className="hero-section" 
        aria-labelledby="hero-heading"
      >
        <div className="hero-split">
          <Badge variant="secondary" className="hero-badge">New Collection</Badge>
          <h1 id="hero-heading" className="hero-heading" style={{ color: '#1a2332' }}>
            Elevate Your<br />
            Skincare Ritual
          </h1>
          <p className="hero-subheading" style={{ color: '#5a6270' }}>
            Scientifically formulated luxury skincare designed to nourish,
            protect, and illuminate your skin — every single day.
          </p>
          <div className="hero-ctas">
            <Button size="lg" onClick={() => navigate('/register')} style={{ backgroundColor: '#1a2332', color: '#fff', borderColor: '#1a2332' }}>
              Shop Now
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/login')} style={{ borderColor: '#1a2332', color: '#1a2332' }}>
              Login
            </Button>
          </div>
          
          <hr className="hero-divider-line" />

          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-num" style={{ color: '#1a2332' }}>50K+</span><span className="hero-stat-label">Happy Customers</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-num" style={{ color: '#1a2332' }}>4.9★</span><span className="hero-stat-label">Avg Rating</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><span className="hero-stat-num" style={{ color: '#1a2332' }}>100%</span><span className="hero-stat-label">Cruelty Free</span></div>
          </div>
        </div>
        <div className="hero-image-pane">
          <img src={heroImage} alt="Lumora luxury skincare collection" loading="eager" />
        </div>
      </section>

      {/* ═══════════ FEATURED CATEGORIES ═══════════ */}
      <section className="home-section" aria-labelledby="categories-heading">
        <div className="section-header">
          <h2 id="categories-heading" className="text-display-2">Shop by Category</h2>
          <button className="see-all-btn" onClick={() => navigate('/shop')} aria-label="See all categories">
            See All <ChevronRight size={16} />
          </button>
        </div>
        <div className="categories-scroll-wrapper">
          <div className="categories-grid">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <Card
                key={cat.id}
                interactive
                className="category-card"
                onClick={() => navigate(`/shop?categoryId=${cat.id}`)}
                role="button"
                tabIndex={0}
                aria-label={`Browse ${cat.label}`}
                onKeyDown={e => e.key === 'Enter' && navigate(`/shop?categoryId=${cat.id}`)}
              >
                <div className="category-icon-wrap" style={{ background: `${cat.color}22` }}>
                  <Icon size={32} color={cat.color} />
                </div>
                <h3 className="text-h3 category-label">{cat.label}</h3>
                <span className="category-arrow"><ChevronRight size={18} /></span>
              </Card>
            );
          })}
          </div>
        </div>
      </section>

      {/* Editorial Banner */}
      <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 var(--space-outer) var(--space-12)' }}>
        <EditorialBanner 
          imageSrc="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=1200"
          overline="The Ritual"
          title="Elevate Your Evening Routine"
          linkText="Shop night care"
          linkTo="/shop"
        />
      </section>

      {/* ═══════════ BEST SELLERS ═══════════ */}
      <section className="home-section" aria-labelledby="bestsellers-heading">
        <div className="section-header">
          <h2 id="bestsellers-heading" className="text-display-2">Best Sellers</h2>
          <button className="see-all-btn" onClick={() => navigate('/shop')} aria-label="See all best sellers">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="products-grid grid-adaptive">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-card-skeleton">
                  <Skeleton height="280px" radius="lg" />
                  <Skeleton height="20px" width="70%" style={{ marginTop: '12px' }} />
                  <Skeleton height="16px" width="40%" style={{ marginTop: '8px' }} />
                </div>
              ))
            : bestSellers.map(product => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  wishlisted={isInWishlist(product.productId)}
                  onWishlist={() => toggleWishlist(product)}
                  onView={() => navigate(`/products/${product.slug}`)}
                />
              ))
          }
        </div>
      </section>

      {/* ═══════════ NEW ARRIVALS CAROUSEL ═══════════ */}
      {newArrivals.length > 0 && (
        <section className="home-section" aria-labelledby="new-arrivals-heading">
          <div className="section-header">
            <h2 id="new-arrivals-heading" className="text-display-2">New Arrivals</h2>
            <div className="carousel-controls">
              <button className="carousel-btn" onClick={prevSlide} disabled={carouselIdx === 0} aria-label="Previous slide">
                <ChevronLeft size={20} />
              </button>
              <button className="carousel-btn" onClick={nextSlide} disabled={carouselIdx >= totalSlides - 1} aria-label="Next slide">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="carousel-viewport" aria-live="polite">
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${carouselIdx * 100}%)` }}
            >
              {newArrivals.map(product => (
                <div key={product.productId} className="carousel-slide">
                  <ProductCard
                    product={product}
                    wishlisted={isInWishlist(product.productId)}
                    onWishlist={() => toggleWishlist(product)}
                    onView={() => navigate(`/products/${product.slug}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ LUXURY BANNER ═══════════ */}
      <section className="luxury-banner" aria-label="Luxury skincare collection">
        <div className="luxury-banner-inner glass-card">
          <div className="luxury-banner-content">
            <Badge variant="accent">Limited Collection</Badge>
            <h2 className="text-display-2" style={{ marginTop: 'var(--space-4)' }}>
              The <span className="gradient-text">Lumora</span> Prestige Line
            </h2>
            <p className="text-body-lg" style={{ marginTop: 'var(--space-4)', maxWidth: '480px' }}>
              Handcrafted with rare botanicals and cutting-edge peptide technology.
              Experience skincare as a luxury ritual.
            </p>
            <Button size="lg" style={{ marginTop: 'var(--space-6)' }} onClick={() => navigate('/shop?tab=prestige')}>
              Discover the Collection <ArrowRight size={18} />
            </Button>
          </div>
          <div className="luxury-banner-visual" aria-hidden="true">
            <div className="luxury-orb" />
          </div>
        </div>
      </section>

      {/* ═══════════ INGREDIENT SPOTLIGHT ═══════════ */}
      <section className="home-section" aria-labelledby="ingredients-heading">
        <h2 id="ingredients-heading" className="text-display-2" style={{ marginBottom: 'var(--space-6)' }}>
          Key Ingredients
        </h2>
        <div className="ingredients-strip">
          {INGREDIENTS.map(ing => {
            const Icon = ing.icon;
            return (
              <div key={ing.name} className="ingredient-card glass-card">
                <div className="ingredient-icon">
                  <Icon size={28} color="var(--color-secondary)" />
                </div>
                <h3 className="text-h3 ingredient-name">{ing.name}</h3>
                <p className="text-body-sm ingredient-benefit">{ing.benefit}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ WHY LUMORA ═══════════ */}
      <section className="why-lumora" aria-labelledby="why-heading">
        <h2 id="why-heading" className="text-display-2 why-heading">Why Lumora</h2>
        <div className="trust-badges-row">
          {TRUST_BADGES.map(badge => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="trust-badge">
                <div className="trust-badge-icon">
                  <Icon size={28} color="var(--color-primary)" />
                </div>
                <span className="text-label trust-badge-label">{badge.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ REVIEWS ═══════════ */}
      <section className="home-section" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-display-2" style={{ marginBottom: 'var(--space-6)' }}>
          What Our Customers Say
        </h2>
        <div className="reviews-grid">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} className="review-card">
              <StarRating rating={t.rating} />
              <p className="text-body review-text">"{t.text}"</p>
              <div className="review-footer">
                <span className="text-h3 review-name">{t.name}</span>
                <Badge variant="success">{t.label}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ═══════════ NEWSLETTER ═══════════ */}
      <section className="newsletter-section" aria-labelledby="newsletter-heading">
        <div className="newsletter-inner glass-card">
          <h2 id="newsletter-heading" className="text-display-2">Join the Ritual</h2>
          <p className="text-body-lg" style={{ marginTop: 'var(--space-3)', color: 'var(--text-muted)' }}>
            Get exclusive offers, skincare tips, and early access to new launches.
          </p>
          <form
            className="newsletter-form"
            onSubmit={e => e.preventDefault()}
            aria-label="Newsletter signup"
          >
            <input
              type="email"
              className="newsletter-input"
              placeholder="Enter your email address..."
              required
              aria-label="Email address for newsletter"
            />
            <Button type="submit" size="md">Subscribe</Button>
          </form>
          <p className="text-body-sm" style={{ marginTop: 'var(--space-3)', color: 'var(--text-muted)' }}>
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <Footer />
    </PageWrapper>
  );
};

/* ─── Product Card (shared within Home) ──────── */
interface ProductCardProps {
  product: Product;
  wishlisted: boolean;
  onWishlist: () => void;
  onView: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, wishlisted, onWishlist, onView }) => {
  return (
    <Card interactive className="product-card" onClick={onView}>
      <div className="product-card-image-wrap">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="product-card-img" loading="lazy" />
          : <div className="product-card-no-img"><ShoppingBag size={40} color="var(--text-muted)" /></div>
        }
        {product.rating > 4.5 && (
          <Badge variant="accent" className="product-card-badge">Top Rated</Badge>
        )}
        <div className="product-card-actions">
          <button
            className={`product-action-btn ${wishlisted ? 'wishlisted' : ''}`}
            onClick={e => { e.stopPropagation(); onWishlist(); }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={18} fill={wishlisted ? 'var(--color-accent)' : 'none'} color={wishlisted ? 'var(--color-accent)' : 'var(--text-primary)'} />
          </button>
          <button
            className="product-action-btn"
            onClick={e => { e.stopPropagation(); onView(); }}
            aria-label="Quick view"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>
      <div className="product-card-body">
        <p className="text-label product-brand">{product.brandName}</p>
        <h3 className="text-h3 product-name">{product.name}</h3>
      </div>
    </Card>
  );
};
