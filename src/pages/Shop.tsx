import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Heart, Eye, ShoppingBag, Search, Check } from 'lucide-react';
import api from '../api/axios';
import { useWishlist } from '../context/WishlistContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FilterBar } from '../components/shop/FilterBar';
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

export const Shop: React.FC<{ categorySlug?: string }> = ({ categorySlug }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    }
  });

  const matchedCategoryId = React.useMemo(() => {
    if (categorySlug) {
      const slugLower = categorySlug.toLowerCase();
      const matched = categories.find((c: any) => c.categoryName.toLowerCase().includes(slugLower));
      return matched ? matched.categoryId.toString() : searchParams.get('categoryId') || '';
    }
    const searchParam = searchParams.get('search');
    if (searchParam) {
      const searchLower = searchParam.toLowerCase().trim();
      if (searchLower.length > 2) {
        const matched = categories.find((c: any) => 
          c.categoryName.toLowerCase().includes(searchLower) || 
          searchLower.includes(c.categoryName.toLowerCase())
        );
        if (matched) return matched.categoryId.toString();
      }
    }
    return searchParams.get('categoryId') || '';
  }, [categorySlug, categories, searchParams]);

  const matchedCategoryName = React.useMemo(() => {
    const id = searchParams.get('categoryId') || matchedCategoryId;
    const matched = categories.find((c: any) => c.categoryId.toString() === id);
    return matched ? matched.categoryName : (categorySlug || searchParams.get('search') || '');
  }, [matchedCategoryId, categories, searchParams, categorySlug]);

  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const [addingId, setAddingId] = React.useState<number | null>(null);
  const [addedId, setAddedId] = React.useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', searchParams.toString(), matchedCategoryId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('size', '100');
      
      const categoryId = searchParams.get('categoryId') || matchedCategoryId;
      if (categoryId) params.append('categoryId', categoryId);
      
      searchParams.getAll('skinTypeId').forEach(val => params.append('skinTypeId', val));
      searchParams.getAll('concernId').forEach(val => params.append('concernId', val));
      searchParams.getAll('ingredient').forEach(val => params.append('ingredient', val));
      
      const minPrice = searchParams.get('minPrice');
      if (minPrice && minPrice !== '0') params.append('minPrice', minPrice);
      
      const maxPrice = searchParams.get('maxPrice');
      if (maxPrice && maxPrice !== '10000') params.append('maxPrice', maxPrice);

      const sortBy = searchParams.get('sortBy');
      if (sortBy) params.append('sortBy', sortBy);
      
      const response = await api.get(`/products?${params.toString()}`);
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
  
  if (searchQuery) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery) || 
      p.description?.toLowerCase().includes(searchQuery) ||
      p.categoryName?.toLowerCase().includes(searchQuery)
    );
  }

  return (
    <PageWrapper>
        <main className="dashboard-main" style={{ width: '100%', padding: '0 1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
          {matchedCategoryName && (
            <h1 style={{ 
              textAlign: 'center', 
              textTransform: 'uppercase', 
              fontFamily: 'var(--font-heading)', 
              fontSize: '32px', 
              margin: 'var(--space-6) 0 var(--space-4)',
              letterSpacing: '0.1em'
            }}>
              {matchedCategoryName}
            </h1>
          )}
          <FilterBar categories={categories} totalResults={products.length} />

          {/* Grid */}
          {isLoading ? (
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, i) => (
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
              <Button variant="secondary" onClick={() => {
                setSearchParams(new URLSearchParams());
              }}>
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
                        <span className="product-price">₹{product.price.toLocaleString('en-IN')} <span className="product-size">· 30 ml</span></span>
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
          )}
        </main>
    </PageWrapper>
  );
};
