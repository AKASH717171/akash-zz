import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiX, HiShoppingBag, HiTrash, HiArrowRight } from 'react-icons/hi';
import useCart from '../../hooks/useCart';

const CartSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { items, cartCount, total, subtotal, shipping, removeFromCart, loading } = useCart();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-luxe-xl
                   flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <HiShoppingBag className="w-5 h-5 text-secondary" />
            <h3 className="font-heading text-lg font-bold text-primary">
              My Cart
            </h3>
            {cartCount > 0 && (
              <span className="bg-secondary text-white text-xs font-bold font-body rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5">
          {loading && items.length === 0 ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="w-16 h-16 skeleton rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                    <div className="skeleton h-4 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-accent/30 rounded-full flex items-center justify-center mb-4">
                <HiShoppingBag className="w-10 h-10 text-secondary/40" />
              </div>
              <h4 className="font-heading text-lg font-bold text-primary mb-2">Cart is Empty</h4>
              <p className="font-body text-sm text-gray-400 mb-5">Add some items to get started!</p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-body font-semibold text-sm
                           hover:bg-secondary transition-colors"
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = item.product || {};
                const mainImg = product.images?.find(img => img.isMain) || product.images?.[0];
                const price = product.salePrice || product.regularPrice || item.price || 0;

                return (
                  <div key={item._id} className="flex gap-3 group">
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex-shrink-0"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={mainImg?.url || '/placeholder.jpg'}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${product.slug}`}
                        onClick={onClose}
                        className="font-body text-sm font-semibold text-primary line-clamp-1 hover:text-secondary transition-colors"
                      >
                        {product.title}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {item.size && (
                          <span className="font-body text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="font-body text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full capitalize">
                            {item.color}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="font-body text-sm">
                          <span className="text-gray-400 text-xs">{item.quantity} × </span>
                          <span className="font-semibold text-primary">${price.toFixed(2)}</span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center
                                     text-gray-300 hover:text-sale transition-all rounded-full"
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-white p-5 space-y-4">
            {/* Summary */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-body text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-primary">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-success' : 'text-primary'}`}>
                  {shipping === 0 ? 'FREE' : `$${shipping}`}
                </span>
              </div>
              <div className="flex justify-between font-body font-bold text-base pt-1 border-t border-gray-100">
                <span className="text-primary">Total</span>
                <span className="text-primary font-heading text-xl">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-body font-bold text-sm
                           hover:bg-secondary transition-colors duration-300 flex items-center justify-center gap-2 shadow-luxe"
              >
                Checkout
                <HiArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/cart"
                onClick={onClose}
                className="w-full py-3 border border-gray-200 rounded-xl font-body font-semibold text-sm
                           text-gray-600 hover:border-secondary hover:text-secondary transition-colors
                           flex items-center justify-center"
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;