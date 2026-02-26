import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';

const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
};

export default useWishlist;
