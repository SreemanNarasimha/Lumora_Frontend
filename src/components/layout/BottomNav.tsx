import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const NAV_ITEMS = [
  { icon: Home,        label: 'Home',    to: '/' },
  { icon: Search,      label: 'Search',  to: '/shop' },
  { icon: Heart,       label: 'Wishlist',to: '/profile/wishlist' },
  { icon: ShoppingBag, label: 'Cart',    to: null, action: 'cart' as const },
  { icon: User,        label: 'Profile', to: '/profile' },
] as const;

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { openCart } = useCart();
  const { user } = useAuth();

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!user) return [];
      const response = await api.get('/cart');
      return response.data as CartItem[];
    },
    enabled: !!user
  });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bottom-nav glass-card" aria-label="Bottom navigation">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = item.to ? (item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)) : false;

        if (item.action === 'cart') {
          return (
            <button
              key="cart"
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={openCart}
              aria-label="Open cart"
              style={{ position: 'relative' }}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={24} />
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    lineHeight: 1
                  }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="bottom-nav-label">Cart</span>
            </button>
          );
        }

        return (
          <Link
            key={item.to!}
            to={item.to!}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={24} />
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
