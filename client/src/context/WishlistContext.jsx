import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) { setWishlist([]); return; }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data.success) setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error('Wishlist fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      const res = await api.post('/wishlist/toggle', { productId });
      if (res.data.success) {
        setWishlist(res.data.wishlist || []);
        toast.success(res.data.message || 'Wishlist updated');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item =>
      (item._id || item) === productId ||
      (item.product?._id || item.product) === productId
    );
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      toggleWishlist,
      isInWishlist,
      wishlistCount: wishlist.length,
      refetch: fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
