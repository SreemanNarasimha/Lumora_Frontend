import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, BookOpen, Sparkles, Heart, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

const NAV_ITEMS = [
  { icon: Compass,  label: 'Discover', to: '/discover' },
  { icon: BookOpen, label: 'Journal',  to: '/journal' },
  { icon: Sparkles, label: 'Rituals',  to: '/rituals' },
  { icon: Heart,    label: 'Wishlist', to: '/profile/wishlist' },
  { icon: User,     label: 'Profile',  to: '/profile', auth: true },
] as const;

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const targetPath = ('auth' in item && item.auth && !user) ? '/login' : item.to;
        
        // Wishlist route starts with /profile but is a separate tab here
        let isActive = false;
        if (item.to === '/profile') {
          isActive = location.pathname === '/profile' || (location.pathname.startsWith('/profile') && !location.pathname.includes('wishlist'));
        } else {
          isActive = location.pathname.startsWith(item.to);
        }

        return (
          <Link
            key={item.to}
            to={targetPath}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="bottom-nav-icon-container">
              {isActive && <span className="active-dot" />}
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
