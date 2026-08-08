import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Star, Heart, Eye, ShoppingBag, Search } from 'lucide-react';
import api from '../api/axios';
import { useWishlist } from '../context/WishlistContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BackButton } from '../components/ui/BackButton';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
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

const SKIN_TYPES = [
  { id: null, label: 'All Types' },
  { id: 2, label: 'Oily' },
  { id: 3, label: 'Dry' },
  { id: 4, label: 'Combination' },
  { id: 5, label: 'Sensitive' },
  { id: 6, label: 'Normal' }
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryIdParam = searchParams.get('categoryId') || '';
  const [selectedCategory, setSelectedCategory] = React.useState(categoryIdParam);
  
  React.useEffect(() => {
    setSelectedCategory(categoryIdParam);
  }, [categoryIdParam]);
  const [addingId, setAddingId] = React.useState<number | null>(null);
  const [addedId, setAddedId] = React.useState<number | null>(null);
  const [minPrice, setMinPrice] = React.useState<number>(0);
  const [maxPrice, setMaxPrice] = React.useState<number>(10000);
  const [selectedSkinType, setSelectedSkinType] = React.useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory, selectedSkinType],
    queryFn: async () => {
      let url = selectedCategory ? `/products?categoryId=${selectedCategory}&size=100` : '/products?size=100';
      if (selectedSkinType) {
        url += `&skinTypeId=${selectedSkinType}`;
      }
      const response = await api.get(url);
      return response.data;
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

  let products: Product[] = data?.content ?? [];
  const query = searchParams.get('search')?.toLowerCase() || '';
  if (query) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description?.toLowerCase().includes(query) ||
      p.categoryName?.toLowerCase().includes(query)
    );
  }
  products = products.filter(p => {
    const price = Number(p.price) || 0;
    return price >= minPrice && price <= maxPrice;
  });


  return (
    <PageWrapper>
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '0 1.5rem 1rem' }}>
        <BackButton label="Back" />
      </div>
      
      <div className="dashboard-layout">
        {/* ─── Sidebar ─── */}
        <aside className="dashboard-sidebar" aria-label="Product filters">
          <div className="sidebar-section">
            <h2 className="sidebar-title">
              <SlidersHorizontal size={18} strokeWidth={1.5} />
              Filters
            </h2>
          </div>



          <div className="sidebar-section">
            <h3 className="sidebar-label">Price Range</h3>
            <div className="filter-options">
              <input 
                type="range" 
                min="0" 
                max="10000" 
                step="100" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  value={minPrice} 
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-general)', fontSize: '13px' }}
                  min="0"
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input 
                  type="number" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-general)', fontSize: '13px' }}
                  min="0"
                />
              </div>
            </div>
          </div>



          <div className="sidebar-section">
            <h3 className="sidebar-label">Availability</h3>
            <div className="filter-options">
              <button className="filter-btn">In Stock</button>
              <button className="filter-btn">All</button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-label">Skin Type</h3>
            <div className="filter-options">
              {SKIN_TYPES.map(st => (
                <label key={st.id || 'all'} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '8px' }}>
                  <input
                    type="radio"
                    name="skintype"
                    checked={selectedSkinType === st.id}
                    onChange={() => setSelectedSkinType(st.id)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  {st.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ─── Main content ─── */}
        <main className="dashboard-main">
          {/* Toolbar */}
          <div className="dashboard-toolbar">
            <h1 className="text-display-2">The Collection</h1>

          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="products-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i}>
                  <Skeleton height="280px" radius="lg" />
                  <Skeleton height="20px" width="70%" style={{ marginTop: '12px' }} />
                  <Skeleton height="16px" width="40%" style={{ marginTop: '8px' }} />
                  <Skeleton height="40px" style={{ marginTop: '16px' }} radius="md" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="empty-state" role="status">
              <ShoppingBag size={56} color="var(--text-muted)" strokeWidth={1} />
              <h2 className="text-h2">Failed to load products</h2>
              <p className="text-body">Please check your connection and try again.</p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}>
                Retry
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state" role="status">
              <Search size={56} color="var(--text-muted)" strokeWidth={1} />
              <h2 className="text-h2">No Products Found</h2>
              <p className="text-body">Try adjusting your filters or browse all products.</p>
              <Button variant="secondary" onClick={() => setSelectedCategory('')}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => {
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
                        <Badge variant="accent" className="product-card-badge-overlay">Top Rated</Badge>
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
                          aria-label={`Add ${product.name} to cart`}
                        >
                          {addedId === product.productId ? '✓ Added' : 'Add to Cart'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </PageWrapper>
  );
};
