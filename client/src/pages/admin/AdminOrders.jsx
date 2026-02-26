import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiSearch, HiEye, HiX } from 'react-icons/hi';
import api from '../../utils/api';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  shipped:    'bg-purple-100 text-purple-700 border-purple-200',
  inTransit:  'bg-orange-100 text-orange-700 border-orange-200',
  delivered:  'bg-green-100 text-green-700 border-green-200',
  cancelled:  'bg-red-100 text-red-700 border-red-200',
  returned:   'bg-gray-100 text-gray-600 border-gray-200',
};

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const dateFrom = searchParams.get('from') || '';
  const dateTo = searchParams.get('to') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const [localSearch, setLocalSearch] = useState(search);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      const { data } = await api.get(`/orders/admin/all?${params}`);
      if (data.success) {
        setOrders(data.orders || []);
        setPagination({ page: data.currentPage || 1, totalPages: data.totalPages || 1, total: data.total || 0 });
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search, status, dateFrom, dateTo, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateParams = (updates) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });
    p.set('page', '1');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: localSearch });
  };

  const totalFilters = [status, dateFrom, dateTo].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-primary">Orders</h2>
        <p className="font-body text-sm text-gray-400">
          {loading ? '...' : `${pagination.total} total orders`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-luxe p-4 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Order ID or customer name..."
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 font-body text-sm
                         focus:outline-none focus:border-secondary transition-colors"
            />
          </div>
          <button type="submit"
            className="px-4 py-2.5 bg-primary text-white rounded-xl font-body text-sm font-semibold hover:bg-secondary transition-colors">
            Search
          </button>
        </form>

        <select
          value={status}
          onChange={e => updateParams({ status: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2.5 font-body text-sm bg-white focus:outline-none focus:border-secondary"
        >
          <option value="">All Status</option>
          {['pending','confirmed','processing','shipped','inTransit','delivered','cancelled','returned'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <input
          type="date" value={dateFrom}
          onChange={e => updateParams({ from: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
        />
        <span className="font-body text-xs text-gray-400">to</span>
        <input
          type="date" value={dateTo}
          onChange={e => updateParams({ to: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
        />

        {(search || totalFilters > 0) && (
          <button
            onClick={() => { setLocalSearch(''); setSearchParams({}); }}
            className="flex items-center gap-1 text-sm font-body text-gray-400 hover:text-sale"
          >
            <HiX className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left font-body font-semibold text-xs text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="skeleton h-4 rounded" style={{ width: '70%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="font-heading text-lg font-bold text-primary mb-1">No Orders Found</p>
                    <p className="font-body text-sm text-gray-400">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-body font-bold text-primary text-xs whitespace-nowrap">
                      #{order.orderNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-body font-semibold text-primary text-xs">{order.user?.name || 'Guest'}</p>
                      <p className="font-body text-[10px] text-gray-400">{order.shippingAddress?.phone}</p>
                    </td>
                    <td className="px-4 py-3.5 font-body text-xs text-gray-500">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3.5 font-body font-semibold text-primary text-xs whitespace-nowrap">
                      ${order.total?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-body text-[10px] font-semibold text-gray-500 capitalize">
                        {order.paymentMethod?.replace('_', ' ') || 'COD'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`font-body text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-body text-xs text-gray-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                                   hover:bg-secondary/10 hover:text-secondary transition-all"
                      >
                        <HiEye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.total > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 flex-wrap gap-3">
            <p className="font-body text-xs text-gray-400">
              Showing {(pagination.page - 1) * 15 + 1}–{Math.min(pagination.page * 15, pagination.total)} of{' '}
              <span className="font-semibold text-primary">{pagination.total}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateParams({ page: String(page - 1) })}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-200 rounded-xl font-body text-xs hover:border-secondary
                           hover:text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="font-body text-xs text-gray-500">{pagination.page} / {pagination.totalPages}</span>
              <button
                onClick={() => updateParams({ page: String(page + 1) })}
                disabled={page === pagination.totalPages}
                className="px-3 py-2 border border-gray-200 rounded-xl font-body text-xs hover:border-secondary
                           hover:text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;