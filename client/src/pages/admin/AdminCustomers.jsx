import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HiSearch, HiEye, HiX, HiUser, HiShoppingBag,
  HiHeart, HiLocationMarker, HiPhone, HiMail,
} from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = (isActive) =>
  isActive
    ? 'bg-green-100 text-green-700 border border-green-200'
    : 'bg-red-100 text-red-600 border border-red-200';

const fmt = (n) => `$${Number(n || 0).toLocaleString()}`;

// ── Customer Detail Modal ──────────────────────────────────────────────────
const CustomerModal = ({ customerId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/admin/customers/${customerId}`)
      .then(({ data: d }) => { if (d.success) setData(d.customer); })
      .catch(() => toast.error('Failed to load customer'))
      .finally(() => setLoading(false));
  }, [customerId]);

  const ORDER_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-luxe-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-heading text-lg font-bold text-primary">Customer Details</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto" />
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-gray-400 font-body">Customer not found.</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Profile */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/30 to-primary/20 flex items-center justify-center text-2xl font-heading font-bold text-primary">
                {data.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-heading text-xl font-bold text-primary">{data.name}</h4>
                  <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE(data.isActive)}`}>
                    {data.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 font-body text-sm text-gray-500">
                    <HiMail className="w-4 h-4" /> {data.email}
                  </div>
                  {data.phone && (
                    <div className="flex items-center gap-2 font-body text-sm text-gray-500">
                      <HiPhone className="w-4 h-4" /> {data.phone}
                    </div>
                  )}
                  <div className="font-body text-xs text-gray-400">
                    Joined: {new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-heading text-xl font-bold text-secondary">{fmt(data.totalSpent)}</div>
                <div className="font-body text-xs text-gray-400">Total Spent</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Orders', value: data.recentOrders?.length || 0, icon: HiShoppingBag, color: 'bg-blue-50 text-blue-600' },
                { label: 'Wishlist', value: data.wishlist?.length || 0, icon: HiHeart, color: 'bg-pink-50 text-pink-600' },
                { label: 'Addresses', value: data.addresses?.length || 0, icon: HiLocationMarker, color: 'bg-green-50 text-green-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mx-auto mb-1`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="font-heading text-lg font-bold text-primary">{value}</div>
                  <div className="font-body text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            {data.recentOrders?.length > 0 && (
              <div>
                <h5 className="font-heading font-semibold text-primary mb-3">Recent Orders</h5>
                <div className="space-y-2">
                  {data.recentOrders.map((o) => (
                    <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-body text-sm font-semibold text-primary">#{o.orderNumber}</div>
                        <div className="font-body text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full capitalize ${ORDER_COLORS[o.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {o.orderStatus}
                        </span>
                        <span className="font-heading font-bold text-sm text-primary">{fmt(o.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wishlist */}
            {data.wishlist?.length > 0 && (
              <div>
                <h5 className="font-heading font-semibold text-primary mb-3">Wishlist ({data.wishlist.length})</h5>
                <div className="grid grid-cols-2 gap-2">
                  {data.wishlist.slice(0, 4).map((p) => (
                    <div key={p._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                        {p.images?.[0]?.url && (
                          <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-body text-xs font-semibold text-primary truncate">{p.title}</div>
                        <div className="font-body text-xs text-secondary">{fmt(p.salePrice || p.regularPrice)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const AdminCustomers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, sort, page, limit: 15 });
      const { data } = await api.get(`/users/admin/customers?${params}`);
      if (data.success) {
        setCustomers(data.customers || []);
        setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
      }
    } catch { toast.error('Failed to fetch customers'); }
    finally { setLoading(false); }
  }, [search, sort, page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const updateParams = (updates) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    p.set('page', '1');
    setSearchParams(p);
  };

  const handleSearch = (e) => { e.preventDefault(); updateParams({ search: localSearch }); };

  const SORT_OPTIONS = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'name', label: 'Name A–Z' },
    { value: '-totalOrders', label: 'Most Orders' },
  ];

  return (
    <div className="space-y-5">
      {selectedId && <CustomerModal customerId={selectedId} onClose={() => setSelectedId(null)} />}

      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-primary">Customers</h2>
        <p className="font-body text-sm text-gray-400">
          {loading ? '...' : `${pagination.total} registered customers`}
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
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-xl font-body text-sm font-semibold hover:bg-primary/90 transition-colors">
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setLocalSearch(''); updateParams({ search: '' }); }}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:border-gray-300 transition-colors">
              <HiX className="w-4 h-4" />
            </button>
          )}
        </form>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="px-3 py-2.5 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-secondary/50 bg-white"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <HiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-body text-gray-400">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Customer', 'Email', 'Phone', 'Orders', 'Total Spent', 'Joined', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary/30 to-primary/20 flex items-center justify-center font-heading font-bold text-primary text-sm flex-shrink-0">
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-body text-sm font-semibold text-primary whitespace-nowrap">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-gray-500">{c.email}</td>
                    <td className="px-4 py-3 font-body text-sm text-gray-500">{c.phone || '—'}</td>
                    <td className="px-4 py-3 font-body text-sm text-center font-semibold text-primary">{c.totalOrders}</td>
                    <td className="px-4 py-3 font-heading text-sm font-bold text-secondary whitespace-nowrap">{fmt(c.totalSpent)}</td>
                    <td className="px-4 py-3 font-body text-xs text-gray-400 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE(c.isActive)}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedId(c._id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-primary"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="font-body text-sm text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p}
                    onClick={() => { const sp = new URLSearchParams(searchParams); sp.set('page', p); setSearchParams(sp); }}
                    className={`w-8 h-8 rounded-lg font-body text-sm font-semibold transition-colors ${p === pagination.page ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                  >{p}</button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;