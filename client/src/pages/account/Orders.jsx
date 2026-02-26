import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiCheckCircle, HiClock, HiChat, HiShoppingBag } from 'react-icons/hi';
import api from '../../utils/api';

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed',  icon: '📋' },
  { key: 'confirmed',  label: 'Confirmed',      icon: '✅' },
  { key: 'processing', label: 'Processing',     icon: '⚙️' },
  { key: 'shipped',    label: 'Shipped',        icon: '📦' },
  { key: 'inTransit',  label: 'In Transit',     icon: '🚚' },
  { key: 'delivered',  label: 'Delivered',      icon: '🎉' },
];

const CANCELLED_STATUSES = ['cancelled', 'returned'];

const STATUS_COLORS = {
  pending:    'text-yellow-600 bg-yellow-50 border-yellow-200',
  confirmed:  'text-blue-600 bg-blue-50 border-blue-200',
  processing: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  shipped:    'text-purple-600 bg-purple-50 border-purple-200',
  inTransit:  'text-orange-600 bg-orange-50 border-orange-200',
  delivered:  'text-green-600 bg-green-50 border-green-200',
  cancelled:  'text-red-600 bg-red-50 border-red-200',
  returned:   'text-gray-600 bg-gray-50 border-gray-200',
};

// ─── Orders LIST ───────────────────────────────────────────
const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        if (data.success) setOrders(data.orders || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <HiShoppingBag className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="font-heading text-xl font-bold text-primary mb-2">No Orders Yet</h3>
      <p className="font-body text-gray-500 mb-6">When you place orders, they will appear here.</p>
      <Link to="/shop" className="px-6 py-3 bg-secondary text-white rounded-xl font-body font-semibold hover:bg-primary transition-colors">
        Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold text-primary">My Orders</h2>
      {orders.map(order => {
        const img = order.items?.[0];
        return (
          <div key={order._id} className="bg-white rounded-2xl shadow-luxe p-5 flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
              {img?.image
                ? <img src={img.image} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-primary text-sm">Order #{order.orderNumber}</p>
              <p className="font-body text-xs text-gray-400 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
                {' · '}{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
              </p>
              <span className={`inline-block font-body text-xs font-bold px-2.5 py-1 rounded-full border mt-1.5 ${STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending}`}>
                {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-heading font-bold text-primary">${order.total?.toFixed(2)}</p>
              <Link to={`/account/orders/${order._id}`}
                className="font-body text-xs text-secondary hover:underline mt-1 block">
                View Details →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Order DETAIL ───────────────────────────────────────────
const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        if (data.success) setOrder(data.order);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-6 w-48 rounded" />
        <div className="bg-white rounded-2xl p-6 shadow-luxe space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-4 w-full rounded" />)}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h3 className="font-heading text-xl font-bold text-primary mb-2">Order Not Found</h3>
        <Link to="/account/orders" className="text-secondary hover:underline font-body text-sm">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const isCancelled = CANCELLED_STATUSES.includes(order.orderStatus);
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.orderStatus);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 font-body text-sm text-gray-500 hover:text-secondary transition-colors"
      >
        <HiArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary">Order #{order.orderNumber}</h2>
          <p className="font-body text-sm text-gray-400">
            {new Date(order.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
          </p>
        </div>
        <span className={`font-body text-sm font-bold px-4 py-1.5 rounded-full border ${STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending}`}>
          {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
        </span>
      </div>

      {/* Progress */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl shadow-luxe p-6">
          <h3 className="font-body font-semibold text-primary mb-5">Order Progress</h3>
          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 hidden sm:block" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-secondary hidden sm:block transition-all duration-700"
              style={{
                width: currentStepIndex >= 0
                  ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`
                  : '0%',
                right: 'unset',
              }}
            />
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 relative">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                const current = i === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center text-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base border-2 z-10 transition-all ${
                      current ? 'border-secondary bg-secondary text-white scale-110 shadow-gold'
                        : done ? 'border-secondary bg-secondary/10 text-secondary'
                          : 'border-gray-200 bg-white text-gray-300'
                    }`}>
                      {done && !current ? <HiCheckCircle className="w-5 h-5" /> : step.icon}
                    </div>
                    <span className={`font-body text-[10px] font-medium leading-tight ${done ? 'text-secondary' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-heading font-bold text-primary">Order Items ({order.items?.length})</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={item.image || '/placeholder.jpg'} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-primary text-sm line-clamp-1">{item.title}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="font-body text-xs text-gray-400">Qty: {item.quantity}</span>
                  {item.size && <span className="font-body text-xs text-gray-400">Size: {item.size}</span>}
                  {item.color && <span className="font-body text-xs text-gray-400 capitalize">Color: {item.color}</span>}
                </div>
              </div>
              <p className="font-heading font-bold text-primary flex-shrink-0">${((item.price || 0) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between font-body text-sm text-gray-500">
            <span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between font-body text-sm text-green-600">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
              <span>−${order.discount?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-body text-sm text-gray-500">
            <span>Shipping</span>
            <span>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost}`}</span>
          </div>
          <div className="flex justify-between font-heading font-bold text-base text-primary border-t border-gray-100 pt-2">
            <span>Total</span><span>${order.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Status History */}
      {order.statusHistory?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-luxe p-5">
          <h3 className="font-heading font-bold text-primary mb-4">Status History</h3>
          <div className="space-y-3">
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-secondary' : 'bg-gray-200'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-body text-sm font-semibold text-primary capitalize">{h.status}</span>
                    <span className="font-body text-xs text-gray-400">
                      {new Date(h.timestamp || h.changedAt).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  {h.note && <p className="font-body text-xs text-gray-500 mt-0.5">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Router: no id → list, id → detail ───────────────────────
const Orders = () => {
  const { id } = useParams();
  return id ? <OrderDetail /> : <OrdersList />;
};

export default Orders;