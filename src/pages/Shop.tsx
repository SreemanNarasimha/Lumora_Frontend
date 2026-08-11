import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Star, Heart, Eye, ShoppingBag, Search, ChevronDown, Check } from 'lucide-react';
import api from '../api/axios';
import { useWishlist } from '../context/WishlistContext';
import { PageWrapper } from '../components/layout/PageWrapper';
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

const CONCERNS = [
  { id: null, label: 'All Concerns' },
  { id: 1, label: 'Dryness / Dehydration' },
  { id: 2, label: 'Dullness / Uneven Tone' },
  { id: 3, label: 'Sensitivity / Redness' },
  { id: 4, label: 'Blemishes / Acne-Prone' },
  { id: 5, label: 'Anti-Aging / Fine Lines' },
  { id: 6, label: 'Universal / Everyday Care' },
];

const INGREDIENTS = [
  'Hyaluronic Acid', 'Vitamin C', 'Niacinamide', 'Salicylic Acid', 'Retinol', 'Peptides'
];

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
    if (!categorySlug) return searchParams.get('categoryId') || '';
    const slugLower = categorySlug.toLowerCase();
    const matched = categories.find((c: any) => c.categoryName.toLowerCase().includes(slugLower));
    return matched ? matched.categoryId.toString() : '';
  }, [categorySlug, categories, searchParams]);

  const concernIdParam = searchParams.get('concernId') || '';
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const [selectedCategory, setSelectedCategory] = React.useState(matchedCategoryId);
  const [selectedConcern, setSelectedConcern] = React.useState<number | null>(concernIdParam ? Number(concernIdParam) : null);
  
  React.useEffect(() => {
    setSelectedCategory(matchedCategoryId);
  }, [matchedCategoryId]);

  React.useEffect(() => {
    setSelectedConcern(concernIdParam ? Number(concernIdParam) : null);
  }, [concernIdParam]);

  const [addingId, setAddingId] = React.useState<number | null>(null);
  const [addedId, setAddedId] = React.useState<number | null>(null);
  const [minPrice, setMinPrice] = React.useState<number>(0);
  const [maxPrice, setMaxPrice] = React.useState<number>(10000);
  const [selectedSkinType, setSelectedSkinType] = React.useState<number | null>(null);
  const [selectedIngredient, setSelectedIngredient] = React.useState<string>('');
  const [filtersExpanded, setFiltersExpanded] = React.useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory, selectedSkinType, selectedConcern, selectedIngredient, minPrice, maxPrice],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('size', '100');
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedSkinType) params.append('skinTypeId', selectedSkinType.toString());
      if (selectedConcern) params.append('concernId', selectedConcern.toString());
      if (selectedIngredient) params.append('ingredient', selectedIngredient);
      if (minPrice > 0) params.append('minPrice', minPrice.toString());
      if (maxPrice < 10000) params.append('maxPrice', maxPrice.toString());
      
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

  let activeFiltersCount = 0;
  if (selectedCategory) activeFiltersCount++;
  if (selectedSkinType) activeFiltersCount++;
  if (selectedConcern) activeFiltersCount++;
  if (selectedIngredient) activeFiltersCount++;
  if (minPrice > 0 || maxPrice < 10000) activeFiltersCount++;

  return (
    <PageWrapper>
      <div className="dashboard-layout" onClick={() => setActiveDropdown(null)} style={{ paddingTop: '20px' }}>
        <main className="dashboard-main" style={{ width: '100%' }}>
          {/* Horizontal Toolbar */}
          <div className="horizontal-toolbar">
            <div className="toolbar-tabs" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { setFiltersExpanded(!filtersExpanded); setActiveDropdown(null); }} style={{ fontWeight: 600 }}>
                <SlidersHorizontal size={14} style={{ marginRight: '4px' }} />
                Filters
              </button>
              
              {filtersExpanded && (
                <div className="filter-dropdown-group">
                  <div className="filter-dropdown-container">
                    <button onClick={() => setActiveDropdown(activeDropdown === 'concern' ? null : 'concern')}>
                      Concern <ChevronDown size={14}/>
                    </button>
                    {activeDropdown === 'concern' && (
                      <div className="filter-dropdown-panel">
                        {CONCERNS.map(con => (
                          <label key={con.id || 'all'} className="filter-radio-label">
                            <input type="radio" name="concern" checked={selectedConcern === con.id} onChange={() => setSelectedConcern(con.id)} />
                            {con.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="filter-dropdown-container">
                    <button onClick={() => setActiveDropdown(activeDropdown === 'skintype' ? null : 'skintype')}>
                      Skin type <ChevronDown size={14}/>
                    </button>
                    {activeDropdown === 'skintype' && (
                      <div className="filter-dropdown-panel">
                        {SKIN_TYPES.map(st => (
                          <label key={st.id || 'all'} className="filter-radio-label">
                            <input type="radio" name="skintype" checked={selectedSkinType === st.id} onChange={() => setSelectedSkinType(st.id)} />
                            {st.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="filter-dropdown-container">
                    <button onClick={() => setActiveDropdown(activeDropdown === 'ingredient' ? null : 'ingredient')}>
                      Ingredient <ChevronDown size={14}/>
                    </button>
                    {activeDropdown === 'ingredient' && (
                      <div className="filter-dropdown-panel" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <label className="filter-radio-label">
                          <input type="radio" name="ingredient" checked={selectedIngredient === ''} onChange={() => setSelectedIngredient('')} />
                          All Ingredients
                        </label>
                        {INGREDIENTS.map(ing => (
                          <label key={ing} className="filter-radio-label">
                            <input type="radio" name="ingredient" checked={selectedIngredient === ing} onChange={() => setSelectedIngredient(ing)} />
                            {ing}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="filter-dropdown-container">
                    <button onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}>
                      Price <ChevronDown size={14}/>
                    </button>
                    {activeDropdown === 'price' && (
                      <div className="filter-dropdown-panel">
                        <input type="range" min="0" max="10000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="price-slider" style={{ marginBottom: '12px' }} />
                        <div className="price-inputs" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} min="0" style={{ width: '80px' }} />
                          <span>-</span>
                          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} min="0" style={{ width: '80px' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="toolbar-meta">
              {activeFiltersCount > 0 && (
                <div className="active-filters-pill">
                  {activeFiltersCount} Filter{activeFiltersCount > 1 ? 's' : ''} Active
                </div>
              )}
              <span className="results-count">{products.length} results</span>
            </div>
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
              <Button variant="secondary" onClick={() => {
                setSelectedCategory('');
                setSelectedConcern(null);
                setSelectedIngredient('');
                setSelectedSkinType(null);
                setMinPrice(0);
                setMaxPrice(10000);
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
      </div>
    </PageWrapper>
  );
};
