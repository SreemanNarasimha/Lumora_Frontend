import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Heart, ShoppingBag, User, Menu, X, Sun, Moon
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { AnnouncementBar } from './AnnouncementBar';
import './Header.css';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
}

interface Concern {
  id: number;
  label: string;
}

export const Header: React.FC = () => {
  const { openCart } = useCart();
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();
  const { setTheme, resolvedTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!user) return [];
      const response = await api.get('/cart');
      return response.data as CartItem[];
    },
    enabled: !!user,
    refetchInterval: 5000 // live count polling for now, or just rely on invalidations
  });



  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
    }
  };

  const isActive = (to: string) => location.pathname.startsWith(to.split('?')[0]);

  return (
    <>
      <AnnouncementBar />
      <header className={`header-root ${scrolled ? 'header-scrolled' : ''}`} role="banner">
        <div className="header-inner editorial-header">
          
          {/* Left: Search Zone & Desktop Nav */}
          <div className="header-zone-left">
            <div className="header-search-container hide-mobile">
              {searchOpen ? (
                <div className="header-search-bar active">
                  <Search size={16} strokeWidth={1} />
                  <input
                    type="search"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    onKeyDown={handleSearch}
                    autoFocus
                    onBlur={() => !searchValue && setSearchOpen(false)}
                  />
                </div>
              ) : (
                <button className="header-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
                  <Search size={22} strokeWidth={1} />
                </button>
              )}
            </div>

            <nav className="header-nav-left hide-mobile">
              <Link to="/dashboard" className={`header-nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Home</Link>
              <Link to="/discover" className={`header-nav-link ${isActive('/discover') ? 'active' : ''}`}>Discover</Link>
              <Link to="/journal" className={`header-nav-link ${isActive('/journal') ? 'active' : ''}`}>Journal</Link>
              <Link to="/rituals" className={`header-nav-link ${isActive('/rituals') ? 'active' : ''}`}>Rituals</Link>
            </nav>
          </div>

          {/* Center: Logo */}
          <div className="header-zone-center">
            <Link to="/" className="header-logo" aria-label="Lumora — Home">LUMORA</Link>
          </div>

          {/* Right: Utilities */}
          <div className="header-zone-right">
            <div className="header-utilities">
              <button className="header-icon-btn hide-mobile" onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
                {resolvedTheme === 'dark' ? <Sun size={20} strokeWidth={1} /> : <Moon size={20} strokeWidth={1} />}
              </button>

              <Link to="/profile/wishlist" className="header-icon-btn hide-mobile" aria-label="Wishlist">
                <Heart size={20} strokeWidth={1} />
                {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
              </Link>

              <Link to={user ? "/profile" : "/login"} className="header-icon-btn hide-mobile" aria-label="Profile">
                <User size={20} strokeWidth={1} />
              </Link>

              <button className="header-icon-btn" onClick={openCart} aria-label="Open cart">
                <ShoppingBag size={20} strokeWidth={1} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-bottom-tab-bar hide-desktop">
        <Link to="/discover" className={`tab-bar-item ${isActive('/discover') ? 'active' : ''}`}>
          <Search size={20} strokeWidth={isActive('/discover') ? 2 : 1} />
          <span>Discover</span>
        </Link>
        <Link to="/journal" className={`tab-bar-item ${isActive('/journal') ? 'active' : ''}`}>
          <Menu size={20} strokeWidth={isActive('/journal') ? 2 : 1} /> {/* Using Menu icon as a placeholder for a book/journal icon */}
          <span>Journal</span>
        </Link>
        <Link to="/rituals" className={`tab-bar-item ${isActive('/rituals') ? 'active' : ''}`}>
          <Heart size={20} strokeWidth={isActive('/rituals') ? 2 : 1} />
          <span>Rituals</span>
        </Link>
        <Link to={user ? "/profile" : "/login"} className={`tab-bar-item ${isActive('/profile') ? 'active' : ''}`}>
          <User size={20} strokeWidth={isActive('/profile') ? 2 : 1} />
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
};
