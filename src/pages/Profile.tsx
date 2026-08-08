import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Package, Heart, MapPin, Star,
  Settings, LogOut, ShoppingBag, Clock, Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BackButton } from '../components/ui/BackButton';
import { Badge } from '../components/ui/Badge';
import api from '../api/axios';
import './Profile.css';

interface OrderItem {
  id: number;
  productNameSnapshot: string;
  quantity: number;
  totalPrice: number;
}

interface Order {
  orderId: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/profile' },
  { icon: Package,         label: 'My Orders',  to: '/profile/orders' },
  { icon: Heart,           label: 'Wishlist',   to: '/profile/wishlist' },
  { icon: MapPin,          label: 'Addresses',  to: '/profile/addresses' },
  { icon: Star,            label: 'Reviews',    to: '/profile/reviews' },
  { icon: Settings,        label: 'Settings',   to: '/profile/settings' },
];

const STATUS_BADGE: Record<string, 'primary' | 'success' | 'error' | 'warning'> = {
  PENDING: 'warning',
  PROCESSING: 'warning',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    }
  });

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
  const rewardPoints = orders.reduce((sum, o) => sum + Math.floor((o.totalAmount || 0) / 10), 0);
  const recentOrders = orders.slice(0, 3);

  const STATS = [
    { icon: Package,         label: 'Total Orders',   value: String(totalOrdersCount), color: 'var(--text-primary)' },
    { icon: Clock,           label: 'Pending',         value: String(pendingOrdersCount), color: 'var(--text-primary)' },
    { icon: Heart,           label: 'Wishlist',        value: String(wishlistCount), color: 'var(--text-primary)' },
    { icon: Gift,            label: 'Reward Points',   value: String(rewardPoints), color: 'var(--text-primary)' },
  ];

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 var(--space-outer)', width: '100%' }}>
        <BackButton label="Back to Shop" />
        
        <div className="profile-layout">
          {/* ─── Sidebar ─── */}
          <aside className="profile-sidebar" aria-label="Profile navigation">
            <div className="profile-avatar-section">
              <div className="profile-avatar" aria-hidden="true">
                {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <p className="profile-name">{user?.fullName ?? 'Guest'}</p>
              </div>
            </div>

            <nav className="profile-nav" aria-label="Profile sections">
              {SIDEBAR_LINKS.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/profile'}
                  className={({ isActive }) => `profile-nav-link ${isActive ? 'active' : ''}`}
                >
                  <link.icon size={18} strokeWidth={1.5} aria-hidden="true" />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>

            <button className="profile-logout-btn" onClick={handleLogout} aria-label="Log out">
              <LogOut size={18} strokeWidth={1.5} aria-hidden="true" />
              Logout
            </button>
          </aside>

          {/* ─── Content ─── */}
          <main className="profile-content">
            {/* Dashboard overview — only shown at /profile */}
            <div className="profile-dashboard">
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '42px', color: 'var(--text-primary)' }}>
                Welcome back, {user?.fullName?.split(' ')[0] ?? 'there'} 👋
              </h1>
              <p className="text-body" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                Here's a summary of your account.
              </p>

              {/* Real Stat cards */}
              <div className="stat-cards" role="list">
                {STATS.map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="stat-card" role="listitem">
                      <div className="stat-icon">
                        <Icon size={24} strokeWidth={1} color={stat.color} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="stat-value">{stat.value}</p>
                        <p className="stat-label">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent 3 Orders */}
              <div className="profile-section">
                <div className="profile-section-header">
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)' }}>Recent Orders</h2>
                  <Link to="/profile/orders" className="see-all-link">
                    View all
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="empty-mini" role="status">
                    <ShoppingBag size={40} strokeWidth={1} color="var(--text-secondary)" style={{ marginBottom: 'var(--space-2)' }} />
                    <p className="text-body" style={{ color: 'var(--text-secondary)' }}>No recent orders</p>
                    <Link to="/dashboard" className="see-all-link" style={{ textDecoration: 'underline' }}>
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {recentOrders.map(order => (
                      <div key={order.orderId} style={{ padding: 'var(--space-5)', background: 'var(--color-surface-hover)', border: '1px solid var(--border-general)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                            <span className="text-body" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>#LMR-{order.orderId}</span>
                            <Badge variant={STATUS_BADGE[order.status] ?? 'primary'}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {order.items?.length || 1} item(s)
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)', margin: 0, marginBottom: 'var(--space-1)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                          <Link to="/profile/orders" className="see-all-link">
                            Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};
