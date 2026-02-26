import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};

export default useCart;