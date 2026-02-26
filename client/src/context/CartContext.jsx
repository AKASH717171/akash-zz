import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const CartContext = createContext(null);

const SHIPPING_THRESHOLD = 0;
const FLAT_SHIPPING = 0;

const calcTotals = (items, coupon) => {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.salePrice || item.product?.regularPrice || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'percent' || coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue || 0;
    }
  }

  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = afterDiscount + shipping;

  return { subtotal, discount, shipping, total };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const { subtotal, discount, shipping, total } = calcTotals(items, coupon);
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  // Load cart
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      try {
        const saved = localStorage.getItem('luxe_cart');
        if (saved) setItems(JSON.parse(saved));
        const savedCoupon = localStorage.getItem('luxe_coupon');
        if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
      } catch { /* ignore */ }
    }
  }, [isAuthenticated]);

  // Sync guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('luxe_cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      if (data.success) setItems(data.cart?.items || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const addToCart = useCallback(async (productId, quantity = 1, size = '', color = '') => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to add items to cart.' };
    }
    try {
      setLoading(true);
      const { data } = await api.post('/cart', { productId, quantity, size, color });
      if (data.success) {
        setItems(data.cart?.items || []);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to add to cart.' };
    } finally { setLoading(false); }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) return removeFromCart(itemId);
    try {
      setLoading(true);
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      if (data.success) { setItems(data.cart?.items || []); return { success: true }; }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally { setLoading(false); }
  }, []);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      setLoading(true);
      const { data } = await api.delete(`/cart/${itemId}`);
      if (data.success) { setItems(data.cart?.items || []); return { success: true }; }
      return { success: false };
    } catch (err) {
      return { success: false, message: err.message };
    } finally { setLoading(false); }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.delete('/cart/clear');
      if (data.success) {
        setItems([]);
        setCoupon(null);
        localStorage.removeItem('luxe_coupon');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    } finally { setLoading(false); }
  }, []);

  const applyCoupon = useCallback(async (code) => {
    if (!code.trim()) return { success: false, message: 'Enter a coupon code' };
    try {
      setCouponLoading(true);
      const { data } = await api.post('/coupons/validate', { code: code.trim().toUpperCase(), cartTotal: subtotal });
      if (data.success) {
        setCoupon(data.coupon);
        localStorage.setItem('luxe_coupon', JSON.stringify(data.coupon));
        toast.success(`Coupon "${code.toUpperCase()}" applied! 🎉`);
        return { success: true, coupon: data.coupon };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message || 'Invalid coupon code' };
    } finally { setCouponLoading(false); }
  }, [subtotal]);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    localStorage.removeItem('luxe_coupon');
    toast.success('Coupon removed');
  }, []);

  return (
    <CartContext.Provider value={{
      items, loading, coupon, couponLoading,
      cartCount, subtotal, discount, shipping, total,
      addToCart, updateQuantity, removeFromCart, clearCart,
      applyCoupon, removeCoupon, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};