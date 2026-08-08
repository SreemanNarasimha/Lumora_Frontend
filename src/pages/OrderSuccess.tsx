import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageWrapper } from '../components/layout/PageWrapper';
import './OrderSuccess.css';

export const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  // In production, get order number from query params or location state
  const orderNumber = `LMR${Date.now().toString().slice(-8)}`;

  return (
    <PageWrapper>
      <div className="order-success-page">
        <div className="order-success-card glass-card">
          {/* Animated checkmark */}
          <div className="success-icon-wrap" aria-hidden="true">
            <div className="success-ring" />
            <CheckCircle size={72} color="var(--color-success)" className="success-icon" />
          </div>

          <h1 className="text-display-2 success-title">Thank You!</h1>
          <p className="text-body-lg success-sub">Your order has been placed successfully.</p>

          <div className="order-number-chip">
            <Package size={18} />
            <span className="text-label">Order #{orderNumber}</span>
          </div>

          <p className="text-body" style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
            We've sent a confirmation to your email. You can track your order from your profile.
          </p>

          {/* Invoice link */}
          <a href="#" className="invoice-link text-body-sm" aria-label="Download invoice">
            <FileText size={16} />
            Download Invoice
          </a>

          {/* CTAs */}
          <div className="success-ctas">
            <Button size="lg" onClick={() => navigate('/profile/orders')} rightIcon={<Package size={18} />}>
              Track Order
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/shop')} rightIcon={<ArrowRight size={18} />}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
