import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { Heart, ShoppingBag, Trash2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist();
  const { openCart } = useCart();
  const navigate = useNavigate();
  const [addingId, setAddingId] = React.useState<number | null>(null);

  const handleAddToCart = async (productId: number) => {
    try {
      setAddingId(productId);
      await api.post('/cart', { productId, quantity: 1 });
      await removeFromWishlist(productId);
      openCart();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add to cart.');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-outer) 4rem', width: '100%' }}>
        <BackButton label="Back to Dashboard" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '42px', color: 'var(--text-primary)' }}>My Wishlist</h1>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center', border: '1px solid var(--border-general)' }}>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div style={{ padding: 'var(--space-10) var(--space-8)', textAlign: 'center', border: '1px dashed var(--border-general)' }}>
            <Heart size={48} strokeWidth={1} color="var(--text-secondary)" style={{ marginBottom: 'var(--space-4)' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Your wishlist is empty</h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              Save items you love by clicking the heart icon on any product.
            </p>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Explore Products
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {wishlist.map(product => (
              <div key={product.productId} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '340px', background: 'var(--color-bg)' }}>
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1608248597309-9069d3000676?w=600'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => removeFromWishlist(product.productId)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--border-general)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <div style={{ padding: 'var(--space-4) 0', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                  <div>
                    <span className="text-body-sm" style={{ color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '11px' }}>
                      {product.brandName || 'Lumora'}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: 'var(--space-1) 0 var(--space-2)', fontSize: '20px' }}>
                      {product.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} strokeWidth={1} fill="var(--text-primary)" color="var(--text-primary)" />
                      <span className="text-body-sm" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.rating ?? 4.5}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-general)', paddingTop: 'var(--space-3)' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)' }}>₹{product.price.toLocaleString('en-IN')}</span>
                    <Button
                      variant="primary"
                      onClick={() => handleAddToCart(product.productId)}
                      disabled={addingId === product.productId}
                    >
                      <ShoppingBag size={16} strokeWidth={1.5} style={{ marginRight: '6px' }} />
                      {addingId === product.productId ? 'Adding...' : 'Move to Cart'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
