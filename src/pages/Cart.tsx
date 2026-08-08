import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Minus, Plus, Trash2, Heart, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import api from '../api/axios';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import './Cart.css';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [couponInput, setCouponInput] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | null>(null);

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/cart');
      return res.data as CartItem[];
    },
  });

  const updateQty = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      if (quantity <= 0) {
        await api.delete(`/cart/${id}`);
      } else {
        await api.put(`/cart/${id}`, { quantity });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeItem = useMutation({
    mutationFn: async (id: number) => api.delete(`/cart/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = appliedCoupon === 'LUMORA10' ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + shipping + tax;

  return (
    <PageWrapper>
      <div className="cart-page">
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '42px', fontWeight: 400, marginBottom: 'var(--space-8)' }}>Your Cart</h1>

        {isLoading ? (
          <div className="cart-layout">
            <div className="cart-items-col">
              {[1, 2, 3].map(i => <Skeleton key={i} height="120px" radius="lg" style={{ marginBottom: '16px' }} />)}
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="cart-empty" role="status">
            <ShoppingBag size={72} color="var(--text-muted)" strokeWidth={1} />
            <h2 className="text-h1" style={{ fontFamily: 'var(--font-heading)', fontWeight: 400 }}>Your Cart is Empty</h2>
            <p className="text-body-lg" style={{ color: 'var(--text-secondary)' }}>Looks like you haven't added anything yet.</p>
            <Button size="lg" onClick={() => navigate('/shop')} rightIcon={<ArrowRight size={18} strokeWidth={1.5} />}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Left: items */}
            <div className="cart-items-col">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img-wrap">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                      : <div className="cart-item-no-img"><ShoppingBag size={28} color="var(--text-muted)" strokeWidth={1} /></div>
                    }
                  </div>
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')} each</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-controls" role="group" aria-label={`Quantity for ${item.name}`}>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity - 1 })}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} strokeWidth={1.5} />
                      </button>
                      <span className="qty-value" aria-live="polite">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="cart-item-subtotal">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    <div className="cart-item-actions">
                      <button className="cart-action-btn" onClick={() => {/* save for later */}} aria-label="Save for later">
                        <Heart size={18} strokeWidth={1.5} />
                      </button>
                      <button className="cart-action-btn danger" onClick={() => removeItem.mutate(item.id)} aria-label={`Remove ${item.name} from cart`}>
                        <Trash2 size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: order summary */}
            <aside className="cart-summary-col">
              <div className="cart-summary">
                <h2>Order Summary</h2>

                {/* Coupon */}
                <div className="coupon-wrap">
                  <div className="coupon-input-wrap">
                    <Tag size={16} color="var(--text-secondary)" strokeWidth={1.5} />
                    <input
                      type="text"
                      className="coupon-input"
                      placeholder="Promo code"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      aria-label="Promo code"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setAppliedCoupon(couponInput === 'LUMORA10' ? couponInput : null)}
                  >
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <p className="coupon-success text-body-sm">✓ Code {appliedCoupon} applied</p>
                )}

                {/* Line items */}
                <div className="summary-lines">
                  <div className="summary-line"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                  {discount > 0 && <div className="summary-line success"><span>Discount</span><span>−₹{discount.toLocaleString('en-IN')}</span></div>}
                  <div className="summary-line"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                  <div className="summary-line"><span>GST (18%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
                  <div className="summary-divider" />
                  <div className="summary-line total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                </div>

                <Button size="lg" style={{ width: '100%' }} onClick={() => navigate('/checkout')} rightIcon={<ArrowRight size={18} />}>
                  Proceed to Checkout
                </Button>
                <p className="text-body-sm" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Free shipping on orders above ₹999
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
