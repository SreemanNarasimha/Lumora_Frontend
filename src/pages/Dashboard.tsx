import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import api from '../api/axios';
import { useWishlist } from '../context/WishlistContext';
import { PageWrapper } from '../components/layout/PageWrapper';

import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Footer } from '../components/layout/Footer';
import heroImage from '../assets/heroDash.png';
import './Dashboard.css';

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  slug: string;
  rating: number;
  categoryName: string;
  brandName: string;
  images: string[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }} aria-label={`${rating} out of 5`}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={13} fill={i <= Math.round(rating) ? '#8A9A86' : 'none'} color={i <= Math.round(rating) ? '#8A9A86' : '#9A96A8'} />
    ))}
  </div>
);



export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isInWishlist, toggleWishlist } = useWishlist();


  const [addingId, setAddingId] = React.useState<number | null>(null);
  const [addedId, setAddedId] = React.useState<number | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    }
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['dashboard_products'],
    queryFn: async () => {
      const response = await api.get('/products?size=200');
      return response.data?.content || [];
    }
  });

  const addToCart = useMutation({
    mutationFn: async (productId: number) => {
      setAddingId(productId);
      await api.post('/cart', { productId, quantity: 1 });
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAddingId(null);
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 1500);
    },
    onError: (err: any) => {
      setAddingId(null);
      alert(err?.response?.data?.message || 'Failed to add to cart.');
    }
  });

  const handleCategoryClick = (name: string) => {
    let slug = name.toLowerCase().trim();
    if (slug === 'cleansers' || slug === 'cleanser') slug = 'cleaner';
    else if (slug === 'ampoules' || slug === 'ampoule') slug = 'Ampoules';
    else if (slug === 'moisturisers' || slug === 'moisturisers' || slug === 'moisturizer') slug = 'moisturizers';
    else if (slug === 'sunscreens' || slug === 'sunscreen') slug = 'sunscreens';
    else if (slug === 'masks' || slug === 'mask') slug = 'masks';
    else if (slug === 'essencess' || slug === 'essence' || slug === 'essences') slug = 'essences';
    else if (slug === 'serums' || slug === 'serum') slug = 'serum';
    else if (slug === 'toners' || slug === 'toner') slug = 'toner';

    navigate(`/${slug}`);
  };

  const categoryImages: Record<string, string> = {
    'cleanser': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=200',
    'cleansers': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=200',
    'toner': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200',
    'toners': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200',
    'moisturiser': 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=200',
    'moisturisers': 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=200',
    'moisturizer': 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=200',
    'moisturizers': 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=200',
    'serums': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200',
    'serum': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200',
    'sunscreen': 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&q=80&w=200',
    'sunscreens': 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&q=80&w=200',
    'ampoules': 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=200',
    'ampoule': 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=200',
    'masks': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=200',
    'mask': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=200',
    'essences': 'https://ik.imagekit.io/DerMatrix/DerMatrix/Essences/Seretkey-8.jpeg?updatedAt=1785218764619',
    'essence': 'https://ik.imagekit.io/DerMatrix/DerMatrix/Essences/Seretkey-8.jpeg?updatedAt=1785218764619',
    'essencess': 'https://ik.imagekit.io/DerMatrix/DerMatrix/Essences/Seretkey-8.jpeg?updatedAt=1785218764619',
  };

  const getCategoryImage = (name: string) => {
    const normalized = name.toLowerCase().trim();
    return categoryImages[normalized] || 'https://images.unsplash.com/photo-1615397323133-722a46e10f3c?auto=format&fit=crop&q=80&w=200';
  };



  return (
    <PageWrapper>

      
      {/* ═══════════ DASHBOARD HERO ═══════════ */}
      <section className="dashboard-hero">
        <img src={heroImage} alt="Shop the Collection" className="dashboard-hero-image" />
      </section>

      {/* ═══════════ CATEGORY CIRCLES ═══════════ */}
      <section className="dashboard-categories-container">
        <div className="dashboard-categories-scroll">

          {categories.map((cat: any) => (
            <div 
              key={cat.categoryId} 
              className={`dashboard-category-circle-wrapper`}
              onClick={() => handleCategoryClick(cat.categoryName)}
            >
              <div className="dashboard-category-circle">
                <img src={getCategoryImage(cat.categoryName)} alt={cat.categoryName} loading="lazy" />
              </div>
              <span className="dashboard-category-name">{cat.categoryName}</span>
            </div>
          ))}
        </div>
      </section>


      {/* ═══════════ NEWLY ADDED PRODUCTS ═══════════ */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', paddingBottom: 'var(--space-8)' }}>
        {categories.map((cat: any) => {
          const catProducts = allProducts.filter((p: Product) => p.categoryName === cat.categoryName).slice(0, 5);
          if (catProducts.length === 0) return null;
          
          return (
            <section key={cat.categoryId} style={{ marginTop: 'var(--space-8)', padding: '0 1.5rem' }}>
              <h2 className="text-h3" style={{ marginBottom: 'var(--space-4)' }}>Newly Added - {cat.categoryName}</h2>
              <div className="products-grid dashboard-products-grid">
                {catProducts.map((product: Product) => {
                  const inWishlist = isInWishlist(product.productId);
                  return (
                    <Card
                      key={product.productId}
                      interactive
                      className="product-card"
                      onClick={() => navigate(`/products/${product.slug}`)}
                    >
                      <div className="product-image-wrap">
                        {product.images?.[0]
                          ? <img src={product.images[0]} alt={product.name} className="product-img" loading="lazy" />
                          : <div className="product-no-img"><ShoppingBag size={40} color="var(--text-muted)" /></div>
                        }
                        
                        {product.rating > 4.5 && (
                          <Badge variant="accent" className="product-card-badge-overlay">Bestseller</Badge>
                        )}
                        
                        <div className="product-card-hover-actions">
                          <button
                            className={`product-action-btn ${inWishlist ? 'active' : ''}`}
                            onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
                            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart size={18} fill={inWishlist ? '#8A9A86' : 'none'} color={inWishlist ? '#8A9A86' : 'currentColor'} />
                          </button>
                          <button
                            className="product-action-btn"
                            onClick={e => { e.stopPropagation(); navigate(`/products/${product.slug}`); }}
                            aria-label="Quick view"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="product-body">
                        <p className="text-label product-brand">{product.brandName}</p>
                        <h3 className="product-name">{product.name}</h3>
                        <StarRating rating={product.rating} />
                        <div className="product-footer">
                          <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
                          <Button
                            size="sm"
                            variant={addedId === product.productId ? 'secondary' : 'primary'}
                            loading={addingId === product.productId}
                            onClick={e => { e.stopPropagation(); addToCart.mutate(product.productId); }}
                            aria-label={`Add ${product.name} to bag`}
                          >
                            {addedId === product.productId ? <><Check size={14} style={{ marginRight: '4px' }}/> Added</> : 'Add to Bag'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <Footer />
    </PageWrapper>
  );
};
