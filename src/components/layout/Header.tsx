import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, Heart, ShoppingBag, User, Sun, Moon, Home as HomeIcon
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
    refetchInterval: 5000
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

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to.split('?')[0]);
  };

  if (location.pathname === '/') {
    return null;
  }

  return (
    <>
      <AnnouncementBar />
      <header className={`header-root ${scrolled ? 'header-scrolled' : ''}`} role="banner">
        <div className="header-inner editorial-header">
          
          {/* Left Zone */}
          <div className="header-zone-left">
            {!(location.pathname === '/' && !user) && (
              <>
                {/* Mobile Icons */}
                <Link to="/" className="header-icon-btn hide-desktop home-mobile-btn" aria-label="Home">
                  <HomeIcon size={22} strokeWidth={1} />
                </Link>

                <button className="header-icon-btn hide-desktop search-mobile-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
                  <Search size={22} strokeWidth={1} />
                </button>

                {/* Desktop Search */}
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

                {/* Desktop Nav Links */}
                <nav className="header-nav-left hide-mobile">
                  <Link to="/" className={`header-nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
                  <Link to="/discover" className={`header-nav-link ${isActive('/discover') ? 'active' : ''}`}>Discover</Link>
                  <Link to="/journal" className={`header-nav-link ${isActive('/journal') ? 'active' : ''}`}>Journal</Link>
                  <Link to="/rituals" className={`header-nav-link ${isActive('/rituals') ? 'active' : ''}`}>Rituals</Link>
                </nav>
              </>
            )}

            {searchOpen && (
              <div className="mobile-search-bar hide-desktop">
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
            )}
          </div>

          {/* Center Zone */}
          <div className="header-zone-center">
            <Link to="/" className="header-logo" aria-label="Lumora - Home">
              Lumora
            </Link>
          </div>

          {/* Right Zone */}
          <div className="header-zone-right">
            <div className="header-utilities">
              
              {location.pathname === '/' && !user ? (
                <>
                  <Link to="/login" className="header-nav-link" style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: '14px', fontWeight: 500 }}>Login</Link>
                  <Link to="/register" className="header-nav-link" style={{ textTransform: 'none', letterSpacing: 'normal', fontSize: '14px', fontWeight: 500 }}>Register</Link>
                </>
              ) : (
                <>
                  <button className="header-icon-btn theme-toggle-btn" onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
                    {resolvedTheme === 'dark' ? <Sun size={20} strokeWidth={1} /> : <Moon size={20} strokeWidth={1} />}
                  </button>

                  <Link to="/profile/wishlist" className="header-icon-btn hide-mobile" aria-label="Wishlist">
                    <Heart size={20} strokeWidth={1} />
                    {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
                  </Link>

                  <button className="header-icon-btn cart-btn" onClick={openCart} aria-label="Open cart">
                    <ShoppingBag size={20} strokeWidth={1} />
                    {cartCount > 0 && <span className="cart-badge-dot"></span>}
                  </button>

                  <Link to={user ? "/profile" : "/login"} className="header-icon-btn hide-mobile" aria-label="Profile">
                    <User size={20} strokeWidth={1} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
