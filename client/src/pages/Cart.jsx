import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiTrash, HiShoppingBag, HiTag, HiX,
  HiArrowRight, HiMinus, HiPlus, HiTruck,
} from 'react-icons/hi';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    items, loading, coupon, couponLoading,
    cartCount, subtotal, discount, shipping, total,
    updateQuantity, removeFromCart, applyCoupon, removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    const result = await applyCoupon(couponCode);
    if (!result.success) setCouponError(result.message);
    else setCouponCode('');
  };

  const handleRemove = async (itemId) => {
    setRemovingId(itemId);
    await removeFromCart(itemId);
    setRemovingId(null);
  };

  const handleQuantity = async (itemId, qty) => {
    if (qty < 1) return;
    await updateQuantity(itemId, qty);
  };

  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiShoppingBag className="w-16 h-16 text-secondary/50" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-primary mb-3">Your Cart is Empty</h2>
          <p className="font-body text-gray-500 mb-8">
            Looks like you haven't added anything yet. Explore our collection!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl
                       font-body font-semibold hover:bg-secondary transition-colors duration-300 shadow-luxe"
          >
            <HiShoppingBag className="w-5 h-5" />
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container-luxe py-6">
          <h1 className="font-heading text-3xl font-bold text-primary">
            Shopping Cart
            {cartCount > 0 && (
              <span className="ml-3 font-body text-base font-normal text-gray-400">
                ({cartCount} item{cartCount !== 1 ? 's' : ''})
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="container-luxe py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ===== LEFT: Cart Items ===== */}
          <div className="lg:col-span-2 space-y-4">

            {/* Free Shipping Banner */}
            {subtotal < 500 && subtotal > 0 && (
              <div className="bg-accent/30 border border-secondary/20 rounded-xl p-4 flex items-center gap-3">
                <HiTruck className="w-5 h-5 text-secondary flex-shrink-0" />
                <p className="font-body text-sm text-primary">
                  Add <span className="font-bold text-secondary">${(500 - subtotal).toLocaleString()}</span> more for
                  <span className="font-bold text-success"> FREE shipping!</span>
                </p>
              </div>
            )}
            {subtotal >= 500 && (
              <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-3">
                <HiTruck className="w-5 h-5 text-success flex-shrink-0" />
                <p className="font-body text-sm text-success font-semibold">🎉 You've unlocked FREE shipping!</p>
              </div>
            )}

            {/* Items List */}
            <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
              {/* Header — desktop only */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 text-xs font-body font-semibold text-gray-400 uppercase tracking-wider">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {loading && items.length === 0 ? (
                <div className="p-6 space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="w-20 h-20 skeleton rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-3/4 rounded" />
                        <div className="skeleton h-3 w-1/2 rounded" />
                        <div className="skeleton h-5 w-1/4 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {items.map((item) => {
                    const product = item.product || {};
                    const mainImg = product.images?.find(img => img.isMain) || product.images?.[0];
                    const price = product.salePrice || product.regularPrice || item.price || 0;
                    const itemTotal = price * item.quantity;
                    const isRemoving = removingId === item._id;

                    return (
                      <div
                        key={item._id}
                        className={`grid grid-cols-12 gap-4 px-6 py-5 items-center transition-opacity ${
                          isRemoving ? 'opacity-40' : ''
                        }`}
                      >
                        {/* Image + Info */}
                        <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                          <Link to={`/product/${product.slug}`} className="flex-shrink-0">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-100">
                              <img
                                src={mainImg?.url || '/placeholder.jpg'}
                                alt={product.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          </Link>
                          <div className="min-w-0">
                            <Link to={`/product/${product.slug}`}>
                              <h3 className="font-body font-semibold text-primary text-sm md:text-base line-clamp-2 hover:text-secondary transition-colors">
                                {product.title}
                              </h3>
                            </Link>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {item.size && (
                                <span className="font-body text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="font-body text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                                  Color: {item.color}
                                </span>
                              )}
                            </div>
                            {/* Mobile price */}
                            <div className="md:hidden mt-1 font-heading font-bold text-primary">
                              ${price.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Price — desktop */}
                        <div className="hidden md:block col-span-2 text-center font-body font-semibold text-primary">
                          ${price.toLocaleString()}
                        </div>

                        {/* Quantity */}
                        <div className="col-span-7 md:col-span-3 flex items-center justify-start md:justify-center">
                          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => handleQuantity(item._id, item.quantity - 1)}
                              disabled={loading}
                              className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors text-primary disabled:opacity-50"
                            >
                              <HiMinus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center font-body font-bold text-primary text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantity(item._id, item.quantity + 1)}
                              disabled={loading}
                              className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors text-primary disabled:opacity-50"
                            >
                              <HiPlus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Total + Remove */}
                        <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-3">
                          <span className="font-heading font-bold text-primary text-base">
                            ${itemTotal.toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleRemove(item._id)}
                            disabled={isRemoving}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                                       hover:bg-sale/10 hover:text-sale transition-all duration-200 flex-shrink-0"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-2xl shadow-luxe p-6">
              <h3 className="font-body font-semibold text-primary flex items-center gap-2 mb-4">
                <HiTag className="w-5 h-5 text-secondary" />
                Have a Coupon Code?
              </h3>

              {coupon ? (
                <div className="flex items-center justify-between bg-success/10 border border-success/20 rounded-xl px-4 py-3">
                  <div>
                    <span className="font-body font-bold text-success text-sm">✅ {coupon.code}</span>
                    <p className="font-body text-xs text-success/80 mt-0.5">
                      {coupon.discountType === 'percent'
                        ? `${coupon.discountValue}% off applied`
                        : `$${coupon.discountValue} off applied`}
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-sale/20 text-sale transition-colors"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                                 focus:outline-none focus:border-secondary transition-colors uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-5 py-3 bg-primary text-white rounded-xl font-body font-semibold text-sm
                                 hover:bg-secondary transition-colors disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
                    >
                      {couponLoading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="font-body text-xs text-sale flex items-center gap-1">
                      <HiX className="w-3 h-3" /> {couponError}
                    </p>
                  )}

                </div>
              )}
            </div>

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 font-body text-sm text-gray-500 hover:text-secondary transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* ===== RIGHT: Order Summary ===== */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-luxe p-6 sticky top-24">
              <h3 className="font-heading text-xl font-bold text-primary mb-5">Order Summary</h3>

              <div className="space-y-3 pb-4 border-b border-gray-100">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-gray-500">Subtotal ({cartCount} items)</span>
                  <span className="font-semibold text-primary">${subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-success flex items-center gap-1">
                      <HiTag className="w-3.5 h-3.5" />
                      Coupon ({coupon?.code})
                    </span>
                    <span className="font-semibold text-success">−${discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-body text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-success' : 'text-primary'}`}>
                    {shipping === 0 ? 'FREE' : `$${shipping}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between font-body py-4 border-b border-gray-100">
                <span className="font-bold text-primary text-lg">Total</span>
                <span className="font-heading font-bold text-2xl text-primary">${total.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="bg-success/10 rounded-xl px-4 py-3 my-4">
                  <p className="font-body text-sm text-success font-semibold text-center">
                    🎉 You're saving ${discount.toLocaleString()} on this order!
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  if (!isAuthenticated) { navigate('/login?redirect=/checkout'); return; }
                  navigate('/checkout');
                }}
                disabled={items.length === 0 || loading}
                className="w-full py-4 bg-primary text-white rounded-xl font-body font-bold text-base
                           hover:bg-secondary transition-all duration-300 shadow-luxe hover:shadow-gold
                           flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                Proceed to Checkout
                <HiArrowRight className="w-5 h-5" />
              </button>

              {/* Trust badges */}
              <div className="mt-5 flex items-center justify-center gap-4 text-xs font-body text-gray-400">
                <span className="flex items-center gap-1">🔒 Secure</span>
                <span className="flex items-center gap-1">↩️ 30-day return</span>
                <span className="flex items-center gap-1">🚚 Fast delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;