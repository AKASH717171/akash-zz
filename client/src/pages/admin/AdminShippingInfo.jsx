import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiSearch, HiEye, HiRefresh } from 'react-icons/hi';
import api from '../../utils/api';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const PAY_COLORS = {
  paid:    'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed:  'bg-red-100 text-red-700',
};

const AdminShippingInfo = () => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/admin/all?limit=100');
      if (data.success) setOrders(data.orders || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      (o.orderNumber || '').toLowerCase().includes(q) ||
      (o.shippingAddress?.fullName || '').toLowerCase().includes(q) ||
      (o.shippingAddress?.email || '').toLowerCase().includes(q) ||
      (o.shippingAddress?.phone || '').includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">Shipping &amp; Payment Info</h1>
          <p className="font-body text-sm text-gray-500 mt-1">All customer orders with shipping details and card info</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl font-body text-sm hover:border-secondary hover:text-secondary transition-colors">
          <HiRefresh className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, phone or order number..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-secondary"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Orders',    value: orders.length,                                              color: 'text-primary' },
          { label: 'Pending Payment', value: orders.filter(o => o.paymentStatus !== 'paid').length,     color: 'text-yellow-600' },
          { label: 'Paid',            value: orders.filter(o => o.paymentStatus === 'paid').length,     color: 'text-green-600' },
          { label: 'Credit Card',     value: orders.filter(o => o.paymentMethod === 'credit_card').length, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-luxe p-4">
            <p className="font-body text-xs text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className={`font-heading text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-luxe p-8 text-center">
          <div className="w-8 h-8 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin mx-auto mb-3" />
          <p className="font-body text-sm text-gray-400">Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-luxe p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-heading text-lg font-bold text-primary mb-1">No orders found</p>
          <p className="font-body text-sm text-gray-400">{search ? 'Try a different search term.' : 'Orders will appear here once customers place them.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const addr = order.shippingAddress || {};
            const isOpen = expanded === order._id;
            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-luxe overflow-hidden">
                {/* Row header */}
                <div
                  className="flex flex-wrap items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : order._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-heading font-bold text-primary text-sm">#{order.orderNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-body font-semibold ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-body font-semibold ${PAY_COLORS[order.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                    <p className="font-body text-sm text-gray-600 mt-0.5">
                      <span className="font-semibold">{addr.fullName}</span>
                      {' · '}
                      <span>{addr.email || order.user?.email}</span>
                      {' · '}
                      <span>{addr.phone}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-heading font-bold text-primary">${order.total?.toLocaleString()}</span>
                    <Link
                      to={`/admin/orders/${order._id}`}
                      onClick={e => e.stopPropagation()}
                      className="p-2 hover:bg-secondary/10 rounded-lg transition-colors text-secondary"
                      title="View full order"
                    >
                      <HiEye className="w-4 h-4" />
                    </Link>
                    <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div className="border-t border-gray-100 p-5 grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50">

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-body text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">📦 Shipping Address</h4>
                      <div className="space-y-1.5 font-body text-sm">
                        <div><span className="text-gray-400">Name: </span><span className="font-semibold text-primary">{addr.fullName || '—'}</span></div>
                        <div><span className="text-gray-400">Email: </span><span className="text-secondary break-all">{addr.email || order.user?.email || '—'}</span></div>
                        <div><span className="text-gray-400">Phone: </span><span>{addr.phone || '—'}</span></div>
                        <div><span className="text-gray-400">Address: </span><span>{addr.addressLine1 || addr.address || '—'}</span></div>
                        <div><span className="text-gray-400">City: </span><span>{addr.city || '—'}</span></div>
                        <div><span className="text-gray-400">State: </span><span>{addr.state || '—'}</span></div>
                        <div><span className="text-gray-400">ZIP: </span><span>{addr.postalCode || addr.zip || '—'}</span></div>
                        <div><span className="text-gray-400">Country: </span><span>{addr.country || 'United States'}</span></div>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div>
                      <h4 className="font-body text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">💳 Card Details</h4>
                      {order.cardDetails?.last4 ? (
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-white">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-gray-400 text-xs">CREDIT CARD</span>
                            <svg viewBox="0 0 38 24" className="w-9 h-5"><circle cx="13" cy="12" r="9" fill="#EB001B"/><circle cx="25" cy="12" r="9" fill="#F79E1B"/><path d="M19 5.5a9 9 0 0 1 0 13A9 9 0 0 1 19 5.5z" fill="#FF5F00"/></svg>
                          </div>
                          <p className="font-mono text-sm tracking-widest mb-3">•••• •••• •••• {order.cardDetails.last4}</p>
                          <div className="flex justify-between">
                            <div>
                              <p className="text-gray-400 text-[9px] uppercase tracking-wider">Holder</p>
                              <p className="font-semibold text-xs uppercase">{order.cardDetails.cardHolder || '—'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400 text-[9px] uppercase tracking-wider">Expires</p>
                              <p className="font-semibold text-xs">{order.cardDetails.expiry || '—'}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-xl p-4 text-center">
                          <p className="font-body text-sm text-gray-400">No card info saved</p>
                          <p className="font-body text-xs text-gray-300 mt-1">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</p>
                        </div>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-body text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🛍️ Order Summary</h4>
                      <div className="space-y-1.5 font-body text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>${order.subtotal?.toLocaleString()}</span></div>
                        {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-green-600">-${order.discount?.toLocaleString()}</span></div>}
                        <div className="flex justify-between"><span className="text-gray-400">Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost}`}</span></div>
                        <div className="flex justify-between font-bold border-t border-gray-200 pt-1.5 mt-1.5"><span>Total</span><span className="text-primary">${order.total?.toLocaleString()}</span></div>
                      </div>
                      <div className="mt-3 space-y-1">
                        {(order.items || []).slice(0, 3).map((item, i) => (
                          <p key={i} className="font-body text-xs text-gray-500 truncate">• {item.title} {item.size ? `(${item.size})` : ''} × {item.quantity}</p>
                        ))}
                        {(order.items || []).length > 3 && (
                          <p className="font-body text-xs text-gray-400">+{order.items.length - 3} more items</p>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminShippingInfo;