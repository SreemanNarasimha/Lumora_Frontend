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
import './Header.css';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const CATEGORIES = [
  { id: '', label: 'All Products' },
  { id: '1', label: 'Cleansers' },
  { id: '2', label: 'Toners' },
  { id: '3', label: 'Essences' },
  { id: '4', label: 'Serums' },
  { id: '5', label: 'Ampoules' },
  { id: '6', label: 'Moisturizers' },
  { id: '7', label: 'Sunscreens' },
  { id: '8', label: 'Masks' },
  { id: '9', label: 'Supplements' },
];

export const Header: React.FC = () => {
  const { openCart } = useCart();
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();
  const { setTheme, resolvedTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
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
    enabled: !!user
  });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
    }
  };



  const isActive = (to: string) => {
    return location.pathname.startsWith(to.split('?')[0]);
  };

  return (
    <>
      <header className={`header-root ${scrolled ? 'header-scrolled' : ''}`} role="banner">
        <div className="header-inner">

          {/* Left: Nav links (desktop) */}
          <nav className="header-nav-left" aria-label="Main navigation">
            <Link to="/shop" className={`header-nav-link ${isActive('/shop') ? 'active' : ''}`}>
              Shop
            </Link>
            
            <div className="header-nav-dropdown">
              <span className="header-nav-link" style={{ cursor: 'pointer' }}>
                Categories
              </span>
              <div className="header-dropdown-menu">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.id || 'all'}
                    to={`/shop${cat.id ? `?categoryId=${cat.id}` : ''}`}
                    className="header-dropdown-item"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/about" className={`header-nav-link ${isActive('/about') ? 'active' : ''}`}>
              About
            </Link>
          </nav>

          {/* Hamburger (mobile) */}
          <button
            className="header-hamburger"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
          </button>

          {/* Center: Logo */}
          <div className="header-logo-container">
            <Link to="/" className="header-logo" aria-label="Lumora — Home">
              LUMORA
            </Link>
          </div>

          {/* Right: Search + icons */}
          <div className="header-right">
            {searchOpen ? (
              <div className="header-search-bar active">
                <Search size={16} strokeWidth={1} />
                <input
                  type="search"
                  placeholder="Search products..."
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

            <button className="header-icon-btn" onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
              {resolvedTheme === 'dark' ? <Sun size={22} strokeWidth={1} /> : <Moon size={22} strokeWidth={1} />}
            </button>

            <Link to="/profile/wishlist" className="header-icon-btn hide-mobile" aria-label="Wishlist">
              <Heart size={22} strokeWidth={1} />
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </Link>

            <button className="header-icon-btn" onClick={openCart} aria-label="Open cart">
              <ShoppingBag size={22} strokeWidth={1} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            <Link to={user ? "/profile" : "/login"} className="header-icon-btn" aria-label="Profile">
              <User size={22} strokeWidth={1} />
            </Link>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {menuOpen && (
          <nav className="header-mobile-menu" aria-label="Mobile navigation">
            <Link to="/shop" className={`header-mobile-link ${isActive('/shop') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              Shop
            </Link>
            
            <div className="header-mobile-category-title">Categories</div>
            <div className="header-mobile-categories">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.id || 'all'}
                  to={`/shop${cat.id ? `?categoryId=${cat.id}` : ''}`}
                  className="header-mobile-link sub-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            <Link to="/about" className={`header-mobile-link ${isActive('/about') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              About
            </Link>
          </nav>
        )}
      </header>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div
          className="header-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
