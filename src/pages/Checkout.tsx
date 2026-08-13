import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BackButton } from '../components/ui/BackButton';
import {
  ShieldCheck, CreditCard, Smartphone, Building2, Banknote,
  CheckCircle2, Plus, Lock
} from 'lucide-react';
import './Checkout.css';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Address {
  addressId: number;
  line1?: string;
  street?: string;
  city: string;
  state: string;
  postalCode?: string;
  zipCode?: string;
  country: string;
  label?: string;
}

declare global {
  interface Window { Razorpay?: any; }
}

type PaymentMethodType = 'razorpay' | 'cod';



const PAYMENT_OPTIONS: { id: PaymentMethodType; label: string; sub: string; Icon: React.ElementType }[] = [
  { id: 'razorpay',   label: 'Razor Pay',          sub: 'Cards, UPI, Netbanking',     Icon: ShieldCheck },
  { id: 'cod',        label: 'Cash on Delivery',   sub: 'Pay upon delivery',          Icon: Banknote    },
];

export const Checkout: React.FC = () => {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm,   setShowAddressForm]   = useState(false);
  const [orderSuccess,      setOrderSuccess]       = useState(false);
  const [paymentMethod,     setPaymentMethod]      = useState<PaymentMethodType>('razorpay');
  const [couponInput,       setCouponInput]        = useState('');
  const [appliedCoupon,     setAppliedCoupon]      = useState<any | null>(null);
  const [couponError,       setCouponError]        = useState<string | null>(null);

  // New address fields
  const [street,  setStreet]  = useState('');
  const [city,    setCity]    = useState('');
  const [state,   setState]   = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await api.get('/cart')).data as CartItem[],
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => (await api.get('/addresses')).data as Address[],
  });

  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      setSelectedAddressId(addresses[0].addressId);
    }
  }, [addresses, selectedAddressId]);

  const addAddress = useMutation({
    mutationFn: async (newAddress: Partial<Address>) =>
      (await api.post('/addresses', newAddress)).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setSelectedAddressId(data.addressId);
      setShowAddressForm(false);
      setStreet(''); setCity(''); setState(''); setZipCode(''); setCountry('');
    }
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress.mutate({ line1: street, city, state, postalCode: zipCode, country: country || 'India' });
  };

  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/coupons/validate', { code, cartTotal: rawSubtotal });
      return { ...res.data, code };
    },
    onSuccess: (data) => {
      setAppliedCoupon(data);
      setCouponError(null);
    },
    onError: (err: any) => {
      setCouponError(err.response?.data || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  });

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    validateCouponMutation.mutate(code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const rawSubtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.discountAmount || 0;
  }
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!selectedAddressId) throw new Error('Please select an address');
      return (await api.post('/orders/checkout', {
        addressId: selectedAddressId,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'RAZORPAY',
        couponCode: appliedCoupon?.code || null
      })).data;
    },
    onSuccess: (data: any) => {
      if (paymentMethod === 'cod') {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        setOrderSuccess(true);
      } else {
        const razorpayKey = data.keyId;
        if (!razorpayKey) {
          alert('Payment gateway is not configured. Please contact support.');
          return;
        }
        const options: any = {
          key: razorpayKey,
          amount: data.amount, currency: data.currency,
          name: 'Lumora', description: 'Premium Skincare Purchase',
          handler: (response: any) => {
            const verifyAndSuccess = () => {
              queryClient.invalidateQueries({ queryKey: ['cart'] });
              queryClient.invalidateQueries({ queryKey: ['orders'] });
              setOrderSuccess(true);
            };
            if (data.razorpayOrderId) {
              api.post(`/orders/${data.razorpayOrderId}/verify`, {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }).then(verifyAndSuccess).catch(verifyAndSuccess);
            } else { verifyAndSuccess(); }
          },
          modal: { ondismiss: () => {
            if (data.razorpayOrderId) {
              api.post(`/orders/${data.razorpayOrderId}/fail`)
                .finally(() => { alert('Payment cancelled.'); navigate('/shop'); });
            } else { navigate('/shop'); }
          }},
          prefill: { name: 'Lumora Customer', email: 'customer@lumora.com', contact: '9999999999' },
          theme: { color: '#1A1A1A' },
        };
        if (data.razorpayOrderId?.startsWith('order_') && !data.razorpayOrderId.startsWith('order_mock')) {
          options.order_id = data.razorpayOrderId;
        }
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (r: any) => {
          if (data.razorpayOrderId) {
            api.post(`/orders/${data.razorpayOrderId}/fail`)
              .finally(() => { alert('Payment failed: ' + r.error.description); });
          }
        });
        rzp.open();
      }
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Failed to place order.');
    },
  });

  /* ── Order success screen ── */
  if (orderSuccess) {
    return (
      <PageWrapper>
        <div className="order-success-wrap">
          <div className="order-success-card">
            <div className="order-success-icon">
              <CheckCircle2 size={28} strokeWidth={1.5} color="var(--text-primary)" />
            </div>
            <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Order Confirmed
            </span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Thank You
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '40px' }}>
              Your order has been placed successfully via{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Secure Payment'}
              </strong>.
              You'll receive a confirmation shortly.
            </p>
            <button
              className="checkout-cta-btn"
              onClick={() => navigate('/shop')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  /* ── Main checkout ── */
  return (
    <PageWrapper>
      <div className="checkout-page">
        <BackButton label="Back to Cart" />

        {/* Page header + step indicator */}
        <div className="checkout-page-header">
          <p className="checkout-kicker">Lumora Skincare</p>
          <h1 className="checkout-title">Checkout</h1>
          <div className="checkout-steps">
            <div className="checkout-step done">
              <span className="step-num">✓</span>
              <span>Cart</span>
            </div>
            <div className="step-connector" />
            <div className="checkout-step active">
              <span className="step-num">2</span>
              <span>Details</span>
            </div>
            <div className="step-connector" />
            <div className="checkout-step">
              <span className="step-num">3</span>
              <span>Payment</span>
            </div>
            <div className="step-connector" />
            <div className="checkout-step">
              <span className="step-num">4</span>
              <span>Confirm</span>
            </div>
          </div>
        </div>

        <div className="checkout-grid">

          {/* ── LEFT: Shipping + Payment ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Shipping Address Panel */}
            <div className="checkout-panel">
              <div className="checkout-panel-header">
                <h2 className="checkout-panel-title">Shipping Address</h2>
                <span className="checkout-panel-badge">Step 1 of 2</span>
              </div>
              <div className="checkout-panel-body">
                {addresses.length === 0 && !showAddressForm && (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    No saved addresses. Add one to continue.
                  </p>
                )}

                {addresses.length > 0 && (
                  <div className="address-grid">
                    {addresses.map(addr => (
                      <div
                        key={addr.addressId}
                        className={`address-card ${selectedAddressId === addr.addressId ? 'selected' : ''}`}
                        onClick={() => setSelectedAddressId(addr.addressId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setSelectedAddressId(addr.addressId)}
                        aria-pressed={selectedAddressId === addr.addressId}
                      >
                        <div className="address-card-radio">
                          {selectedAddressId === addr.addressId && <div className="address-card-radio-dot" />}
                        </div>
                        {addr.label && <p className="address-card-label">{addr.label}</p>}
                        <p className="address-card-line">{addr.line1 || addr.street}</p>
                        <p className="address-card-sub">{addr.city}, {addr.state} {addr.postalCode || addr.zipCode}</p>
                        <p className="address-card-sub">{addr.country}</p>
                      </div>
                    ))}
                  </div>
                )}

                {!showAddressForm ? (
                  <button className="add-address-btn" onClick={() => setShowAddressForm(true)}>
                    <Plus size={14} />
                    Add New Address
                  </button>
                ) : (
                  <div className="new-address-form">
                    <h3>New Address</h3>
                    <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        className="checkout-input"
                        type="text" placeholder="Street Address" required
                        value={street} onChange={e => setStreet(e.target.value)}
                      />
                      <div className="form-row">
                        <input className="checkout-input" type="text" placeholder="City" required value={city} onChange={e => setCity(e.target.value)} />
                        <input className="checkout-input" type="text" placeholder="State" required value={state} onChange={e => setState(e.target.value)} />
                      </div>
                      <div className="form-row">
                        <input className="checkout-input" type="text" placeholder="Zip Code" required value={zipCode} onChange={e => setZipCode(e.target.value)} />
                        <input className="checkout-input" type="text" placeholder="Country" required value={country} onChange={e => setCountry(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                        <button type="submit" className="checkout-cta-btn" style={{ flex: 1, padding: '12px' }} disabled={addAddress.isPending}>
                          {addAddress.isPending ? 'Saving...' : 'Save Address'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid var(--border-general)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Panel */}
            <div className="checkout-panel">
              <div className="checkout-panel-header">
                <h2 className="checkout-panel-title">Payment Method</h2>
                <div className="checkout-panel-badge">
                  <ShieldCheck size={13} strokeWidth={1.5} />
                  Razorpay Secured
                </div>
              </div>
              <div className="checkout-panel-body">
                <div className="payment-grid">
                  {PAYMENT_OPTIONS.map(opt => {
                    const isSelected = paymentMethod === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`payment-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod(opt.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setPaymentMethod(opt.id)}
                        aria-pressed={isSelected}
                      >
                        <div className="payment-card-icon">
                          <opt.Icon size={20} strokeWidth={1.5} />
                        </div>
                        <div className="payment-card-info">
                          <p className="payment-card-name">{opt.label}</p>
                          <p className="payment-card-sub">{opt.sub}</p>
                        </div>
                        <div className="payment-radio">
                          {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)' }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Order Summary (sticky) ── */}
          <div className="checkout-summary">
            <div className="summary-header">
              <h2 className="summary-title">Order Summary</h2>
            </div>

            <div className="summary-body">
              {/* Cart items */}
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <img src={item.imageUrl} alt={item.name} className="summary-item-img" />
                    <div className="summary-item-info">
                      <p className="summary-item-name">{item.name}</p>
                      <p className="summary-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="summary-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              {/* Coupon */}
              <div style={{ marginBottom: '8px' }}>
                <div className="coupon-row">
                  <input
                    className="coupon-input"
                    type="text"
                    placeholder="Promo / Coupon Code"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button className="coupon-apply-btn" onClick={handleApplyCoupon}>Apply</button>
                </div>
                {appliedCoupon && (
                  <div className="coupon-applied-tag">
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-sage, #8A9A86)' }}>
                      ✓ {appliedCoupon.code} Applied
                    </span>
                    <button className="coupon-remove-btn" onClick={handleRemoveCoupon}>Remove</button>
                  </div>
                )}
                {couponError && (
                  <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '6px' }}>{couponError}</p>
                )}
              </div>

              <div className="summary-divider" />

              {/* Price rows */}
              <div style={{ marginTop: '8px' }}>
                <div className="summary-row">
                  <span className="summary-row-label">Subtotal</span>
                  <span className="summary-row-value">₹{rawSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="summary-row">
                    <span className="summary-row-label">Discount</span>
                    <span className="summary-row-value discount">−₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span className="summary-row-label">Shipping</span>
                  <span className="summary-row-value">Free</span>
                </div>
                <div className="summary-total-row">
                  <span className="summary-total-label">Total</span>
                  <span className="summary-total-value">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="checkout-cta-wrap">
              <button
                className="checkout-cta-btn"
                onClick={() => placeOrder.mutate()}
                disabled={placeOrder.isPending || !selectedAddressId || cartItems.length === 0}
              >
                <Lock size={14} />
                {placeOrder.isPending ? 'Processing…' : `Pay ₹${finalTotal.toLocaleString('en-IN')}`}
              </button>
              <div className="checkout-secure-note">
                <ShieldCheck size={12} strokeWidth={1.5} />
                Secured by Razorpay · 256-bit encryption
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
};
