import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

export interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  slug?: string;
  rating: number;
  categoryName?: string;
  brandName?: string;
  images: string[];
}

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  isLoading: boolean;
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  refetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get('/wishlist');
      setWishlist(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId: number) => {
    return (wishlist || []).some(p => p.productId === productId);
  };

  const addToWishlist = async (productId: number) => {
    try {
      await api.post(`/wishlist/${productId}`);
      await fetchWishlist();
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    const itemToRemove = wishlist.find(p => p.productId === productId);
    setWishlist(prev => prev.filter(p => p.productId !== productId));
    try {
      await api.delete(`/wishlist/${productId}`);
      // fetchWishlist() is optional here, we could run it in background to sync
      fetchWishlist();
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      if (itemToRemove) {
        setWishlist(prev => [...prev, itemToRemove]);
      }
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      alert("Please login to add items to your wishlist.");
      return;
    }
    const currentlyInWishlist = isInWishlist(product.productId);
    
    if (currentlyInWishlist) {
      setWishlist(prev => prev.filter(p => p.productId !== product.productId));
      try {
        await api.delete(`/wishlist/${product.productId}`);
        fetchWishlist();
      } catch (err) {
        console.error('Failed to remove from wishlist:', err);
        setWishlist(prev => [...prev, product]);
      }
    } else {
      setWishlist(prev => [product, ...prev]);
      try {
        await api.post(`/wishlist/${product.productId}`);
        fetchWishlist();
      } catch (err) {
        console.error('Failed to add to wishlist:', err);
        setWishlist(prev => prev.filter(p => p.productId !== product.productId));
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist: wishlist || [],
        wishlistCount: (wishlist || []).length,
        isLoading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        refetchWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
