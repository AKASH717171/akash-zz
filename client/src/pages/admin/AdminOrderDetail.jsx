import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiPrinter, HiCheckCircle } from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_FLOW = [
  { key: 'pending',    label: 'Pending',     color: 'bg-yellow-500' },
  { key: 'confirmed',  label: 'Confirmed',   color: 'bg-blue-500' },
  { key: 'processing', label: 'Processing',  color: 'bg-indigo-500' },
  { key: 'shipped',    label: 'Shipped',     color: 'bg-purple-500' },
  { key: 'inTransit',  label: 'In Transit',  color: 'bg-orange-500' },
  { key: 'delivered',  label: 'Delivered',   color: 'bg-success' },
];

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  inTransit:  'bg-orange-100 text-orange-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  returned:   'bg-gray-100 text-gray-600',
};

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [note, setNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/admin/${id}`);
      if (data.success) {
        setOrder(data.order);
        setSelectedStatus(data.order.orderStatus);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (id) fetchOrder(); }, [id]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order.orderStatus) return;
    setUpdating(true);
    try {
      const { data } = await api.put(`/orders/admin/${id}/status`, {
        status: selectedStatus,
        note: note || undefined,
      });
      if (data.success) {
        toast.success('Order status updated!');
        setOrder(data.order);
        setNote('');
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdating(false); }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-luxe p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="skeleton h-4 rounded" style={{ width: `${60 + j * 10}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="font-heading text-xl font-bold text-primary">Order not found</p>
        <Link to="/admin/orders" className="text-secondary hover:underline font-body text-sm mt-2 block">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const currentStepIdx = STATUS_FLOW.findIndex(s => s.key === order.orderStatus);
  const isCancelled = ['cancelled', 'returned'].includes(order.orderStatus);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/orders"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:border-secondary transition-colors shadow-sm">
            <HiArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h2 className="font-heading text-xl font-bold text-primary">
              Order #{order.orderNumber}
            </h2>
            <p className="font-body text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-body text-xs font-bold px-3 py-1.5 rounded-full ${
            STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending
          }`}>
            {order.orderStatus}
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl
                       font-body text-sm font-semibold text-gray-600 hover:border-secondary hover:text-secondary transition-colors"
          >
            <HiPrinter className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Progress */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl shadow-luxe p-6">
          <h3 className="font-body font-semibold text-primary mb-5">Order Progress</h3>
          <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 hidden sm:block" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-secondary hidden sm:block transition-all duration-700"
              style={{
                width: currentStepIdx >= 0 ? `${(currentStepIdx / (STATUS_FLOW.length - 1)) * 100}%` : '0%',
                right: 'unset',
              }}
            />
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 relative">
              {STATUS_FLOW.map((step, i) => {
                const done = i <= currentStepIdx;
                const current = i === currentStepIdx;
                return (
                  <div key={step.key} className="flex flex-col items-center text-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                      current ? `${step.color} border-transparent text-white scale-110 shadow-lg`
                        : done ? 'border-secondary bg-secondary/10 text-secondary'
                          : 'border-gray-200 bg-white text-gray-300'
                    }`}>
                      {done && !current ? (
                        <HiCheckCircle className="w-4 h-4 text-secondary" />
                      ) : (
                        <span className="text-[10px] font-bold">{i + 1}</span>
                      )}
                    </div>
                    <span className={`font-body text-[10px] font-medium leading-tight ${
                      done ? 'text-secondary' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-heading font-bold text-primary">
                Order Items ({order.items?.length || 0})
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {(order.items || []).map((item, i) => {
                const product = item.product || {};
                const img = product.images?.find(x => x.isMain) || product.images?.[0];
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={img?.url || '/placeholder.jpg'} alt={product.title || item.title}
                        className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-primary text-sm line-clamp-1">
                        {product.title || item.title}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="font-body text-xs text-gray-400">Qty: {item.quantity}</span>
                        {item.size && <span className="font-body text-xs text-gray-400">Size: {item.size}</span>}
                        {item.color && <span className="font-body text-xs text-gray-400 capitalize">Color: {item.color}</span>}
                        <span className="font-body text-xs text-secondary font-semibold">
                          ${item.price?.toLocaleString()} each
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-heading font-bold text-primary">
                        ${((item.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            <div className="px-5 py-4 border-t border-gray-100 space-y-2.5">
              <div className="flex justify-between font-body text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${order.subtotal?.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between font-body text-sm text-success">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>−${order.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-body text-sm text-gray-500">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-heading font-bold text-base text-primary border-t border-gray-100 pt-2.5">
                <span>Total</span>
                <span>${order.total?.toLocaleString()}</span>
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
                          {new Date(h.timestamp || h.changedAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
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

        {/* Right */}
        <div className="space-y-5">
          {/* Update Status */}
          <div className="bg-white rounded-2xl shadow-luxe p-5">
            <h3 className="font-heading font-bold text-primary mb-4">Update Status</h3>
            <div className="space-y-3">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                           focus:outline-none focus:border-secondary bg-white"
              >
                {[...STATUS_FLOW.map(s => s.key), 'cancelled', 'returned'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                           focus:outline-none focus:border-secondary resize-none"
              />
              <button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === order.orderStatus}
                className="w-full py-3 bg-primary text-white rounded-xl font-body font-semibold text-sm
                           hover:bg-secondary transition-colors disabled:opacity-60"
              >
                {updating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Shipping Information - Full Card */}
          <div className="bg-white rounded-2xl shadow-luxe p-5">
            <h3 className="font-heading font-bold text-primary mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">📦</span>
              Shipping Information
            </h3>
            <div className="space-y-3 font-body text-sm">
              {/* Name */}
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-5 mt-0.5 flex-shrink-0">👤</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Full Name</p>
                  <p className="font-semibold text-primary">{order.shippingAddress?.fullName || '—'}</p>
                </div>
              </div>
              {/* Email */}
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-5 mt-0.5 flex-shrink-0">✉️</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-secondary break-all">{order.shippingAddress?.email || order.user?.email || '—'}</p>
                </div>
              </div>
              {/* Phone */}
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-5 mt-0.5 flex-shrink-0">📞</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="text-gray-700">{order.shippingAddress?.phone || '—'}</p>
                </div>
              </div>
              {/* Address */}
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-5 mt-0.5 flex-shrink-0">🏠</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Street Address</p>
                  <p className="text-gray-700">{order.shippingAddress?.addressLine1 || order.shippingAddress?.address || '—'}</p>
                </div>
              </div>
              {/* City / State / ZIP */}
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-5 mt-0.5 flex-shrink-0">📍</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">City, State, ZIP</p>
                  <p className="text-gray-700">
                    {[
                      order.shippingAddress?.city,
                      order.shippingAddress?.state,
                      order.shippingAddress?.postalCode || order.shippingAddress?.zip,
                    ].filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
              </div>
              {/* Country */}
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-5 mt-0.5 flex-shrink-0">🌎</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Country</p>
                  <p className="text-gray-700">{order.shippingAddress?.country || 'United States'}</p>
                </div>
              </div>
            </div>
            {order.user && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link to={`/admin/customers?search=${order.user._id}`}
                  className="font-body text-xs text-secondary hover:underline flex items-center gap-1">
                  View Customer Profile →
                </Link>
              </div>
            )}
          </div>

          {/* Payment & Card Details */}
          <div className="bg-white rounded-2xl shadow-luxe p-5">
            <h3 className="font-heading font-bold text-primary mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs">💳</span>
              Payment Information
            </h3>

            {/* Status row */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-body text-xs text-gray-400 uppercase tracking-wider mb-0.5">Status</p>
                <span className={`font-body font-bold text-sm px-2.5 py-1 rounded-full ${
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                </span>
              </div>
              <div className="text-right">
                <p className="font-body text-xs text-gray-400 uppercase tracking-wider mb-0.5">Total Charged</p>
                <p className="font-heading font-bold text-xl text-primary">${order.total?.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3 font-body text-sm">
              {/* Method */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-semibold text-primary">
                  {order.paymentMethod === 'credit_card' ? '💳 Credit Card' : order.paymentMethod === 'cod' ? 'Cash on Delivery' : (order.paymentMethod?.replace('_', ' ') || 'N/A')}
                </span>
              </div>

              {/* Card details if available */}
              {order.cardDetails?.last4 && (
                <>
                  <div className="h-px bg-gray-100" />
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Card Details</p>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-white">
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-5">
                      <span className="text-gray-400 text-xs tracking-widest">CREDIT CARD</span>
                      <svg viewBox="0 0 38 24" className="w-10 h-6"><circle cx="13" cy="12" r="9" fill="#EB001B"/><circle cx="25" cy="12" r="9" fill="#F79E1B"/><path d="M19 5.5a9 9 0 0 1 0 13A9 9 0 0 1 19 5.5z" fill="#FF5F00"/></svg>
                    </div>
                    {/* Card Number */}
                    <p className="font-mono text-lg tracking-widest mb-5 text-white/90">
                      {order.cardDetails.cardNumber
                        ? order.cardDetails.cardNumber.replace(/(.{4})/g, '$1 ').trim()
                        : `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${order.cardDetails.last4}`}
                    </p>
                    {/* Bottom row: Holder | Expiry | CVV */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-gray-400 text-[9px] uppercase tracking-wider mb-0.5">Card Holder</p>
                        <p className="font-semibold text-xs uppercase leading-tight">{order.cardDetails.cardHolder || '\u2014'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-[9px] uppercase tracking-wider mb-0.5">Expires</p>
                        <p className="font-semibold text-xs">{order.cardDetails.expiry || '\u2014'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-[9px] uppercase tracking-wider mb-0.5">CVV</p>
                        <p className="font-bold text-sm text-yellow-300">
                          {order.cardDetails.cvv
                            ? order.cardDetails.cvv
                            : <span className="text-gray-500 text-[10px] font-normal">N/A</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mark as Paid */}
            {order.paymentStatus !== 'paid' && (
              <button
                onClick={async () => {
                  try {
                    const { data } = await api.put(`/orders/admin/${order._id}/payment`, { paymentStatus: 'paid' });
                    if (data.success) { toast.success('Marked as paid!'); fetchOrder(); }
                    else toast.error(data.message || 'Failed');
                  } catch { toast.error('Failed to update payment status'); }
                }}
                className="w-full mt-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-body text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <HiCheckCircle className="w-4 h-4" /> Mark as Paid
              </button>
            )}

            {/* Live payment activate note */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="font-body text-xs text-blue-700 font-semibold mb-1">💡 Activate Live Payments</p>
              <p className="font-body text-xs text-blue-600">
                Card info is saved. To process real payments, integrate Stripe or PayPal with your developer. Orders will auto-confirm once live payment is active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;