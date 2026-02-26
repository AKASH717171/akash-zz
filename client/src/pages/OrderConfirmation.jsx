import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { HiCheckCircle, HiShoppingBag, HiClipboardList, HiChat } from 'react-icons/hi';
import api from '../utils/api';

const OrderConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      api.get(`/orders/${id}`)
        .then(({ data }) => { if (data.success) setOrder(data.order); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-luxe-xl overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-primary to-primary/80 py-10 px-8 text-center text-white">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <HiCheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold mb-2">Order Placed!</h1>
            <p className="font-body text-white/70 text-sm">
              Thank you for shopping with LUXE FASHION
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Order Info */}
            {order && (
              <>
                <div className="bg-accent/20 rounded-2xl p-5 text-center">
                  <p className="font-body text-sm text-gray-500 mb-1">Your Order Number</p>
                  <p className="font-heading text-2xl font-bold text-primary tracking-wider">
                    #{order.orderNumber}
                  </p>
                  <p className="font-body text-xs text-gray-400 mt-2">
                    A confirmation will be sent to{' '}
                    <span className="font-semibold text-secondary">
                      {order.shippingAddress?.email}
                    </span>
                  </p>
                </div>

                {/* Items Summary */}
                <div>
                  <h3 className="font-body font-semibold text-primary mb-3">
                    Order Items ({order.items?.length || 0})
                  </h3>
                  <div className="space-y-3 max-h-52 overflow-y-auto">
                    {(order.items || []).map((item, i) => {
                      const product = item.product || {};
                      const mainImg = product.images?.find(img => img.isMain) || product.images?.[0];
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={mainImg?.url || '/placeholder.jpg'}
                              alt={product.title || item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm font-semibold text-primary line-clamp-1">
                              {product.title || item.title}
                            </p>
                            <p className="font-body text-xs text-gray-400">
                              Qty: {item.quantity}
                              {item.size ? ` · ${item.size}` : ''}
                              {item.color ? ` · ${item.color}` : ''}
                            </p>
                          </div>
                          <span className="font-body text-sm font-semibold text-primary flex-shrink-0">
                            ${((item.price || 0) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between font-body text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>${order.subtotal?.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between font-body text-sm text-success">
                      <span>Discount</span>
                      <span>−${order.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-body text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost}`}</span>
                  </div>
                  <div className="flex justify-between font-heading font-bold text-lg text-primary border-t border-gray-100 pt-2">
                    <span>Total Paid</span>
                    <span>${order.total?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Delivering To
                  </p>
                  <p className="font-body text-sm font-semibold text-primary">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p className="font-body text-sm text-gray-500">
                    {order.shippingAddress?.address}, {order.shippingAddress?.city}
                    {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''}
                  </p>
                  <p className="font-body text-sm text-gray-500">{order.shippingAddress?.phone}</p>
                </div>
              </>
            )}

            {/* What's Next */}
            <div className="bg-secondary/10 rounded-2xl p-5">
              <h4 className="font-body font-bold text-secondary mb-3">📦 What happens next?</h4>
              <ol className="space-y-2 font-body text-sm text-gray-600">
                {[
                  'We will confirm your order within 24 hours',
                  'Your order will be packed and dispatched',
                  'You will receive an SMS with tracking info',
                  'Delivery within 3-7 business days',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/account/orders"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white
                           rounded-xl font-body font-semibold text-sm hover:bg-secondary transition-colors"
              >
                <HiClipboardList className="w-4 h-4" />
                View My Orders
              </Link>
              <Link
                to="/shop"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-gray-200
                           text-gray-600 rounded-xl font-body font-semibold text-sm hover:border-secondary
                           hover:text-secondary transition-colors"
              >
                <HiShoppingBag className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Chat CTA */}
            <div className="text-center">
              <button className="inline-flex items-center gap-2 text-sm font-body text-secondary hover:underline">
                <HiChat className="w-4 h-4" />
                Need help with your order? Chat with us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;