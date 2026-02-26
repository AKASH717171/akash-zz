import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HiPlus, HiSearch, HiPencil, HiTrash, HiEye,
  HiFilter, HiX, HiCheckCircle,
} from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  active:    'bg-green-100 text-green-700',
  draft:     'bg-gray-100 text-gray-600',
  inactive:  'bg-red-100 text-red-600',
};

const ConfirmModal = ({ title, message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-luxe-xl p-6 w-full max-w-sm animate-scale-in">
      <div className="text-center">
        <div className="w-14 h-14 bg-sale/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiTrash className="w-7 h-7 text-sale" />
        </div>
        <h3 className="font-heading text-lg font-bold text-primary mb-2">{title}</h3>
        <p className="font-body text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl font-body font-semibold
                       text-sm text-gray-600 hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-sale text-white rounded-xl font-body font-semibold text-sm
                       hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? '...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selected, setSelected] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      if (data.success) setCategories(data.categories || []);
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (status) params.set('status', status);
      const { data } = await api.get(`/products/admin/all?${params}`);
      if (data.success) {
        setProducts(data.products || []);
        setPagination({
          page: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0,
        });
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search, category, status, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

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

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/products/${deleteModal._id}`);
      if (data.success) {
        toast.success('Product deleted');
        setDeleteModal(null);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} products?`)) return;
    try {
      await Promise.all(selected.map(id => api.delete(`/products/${id}`)));
      toast.success(`${selected.length} products deleted`);
      setSelected([]);
      fetchProducts();
    } catch {
      toast.error('Some deletions failed');
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelected(prev => prev.length === products.length ? [] : products.map(p => p._id));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary">Products</h2>
          <p className="font-body text-sm text-gray-400">Manage your product catalog</p>
        </div>
        <Link
          to="/admin/products/add"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl
                     font-body font-semibold text-sm hover:bg-secondary transition-colors shadow-luxe"
        >
          <HiPlus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-luxe p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 font-body text-sm
                         focus:outline-none focus:border-secondary transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-primary text-white rounded-xl font-body text-sm font-semibold
                       hover:bg-secondary transition-colors"
          >
            Search
          </button>
        </form>

        {/* Category Filter */}
        <select
          value={category}
          onChange={e => updateParams({ category: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2.5 font-body text-sm bg-white
                     focus:outline-none focus:border-secondary min-w-36"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={e => updateParams({ status: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2.5 font-body text-sm bg-white
                     focus:outline-none focus:border-secondary"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Clear */}
        {(search || category || status) && (
          <button
            onClick={() => { setLocalSearch(''); setSearchParams({}); }}
            className="flex items-center gap-1 text-sm font-body text-gray-400 hover:text-sale transition-colors"
          >
            <HiX className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3
                       flex items-center justify-between">
          <p className="font-body text-sm font-semibold text-primary">
            {selected.length} product{selected.length !== 1 ? 's' : ''} selected
          </p>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-4 py-2 bg-sale text-white rounded-xl
                       font-body text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            <HiTrash className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-secondary rounded"
                  />
                </th>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left font-body font-semibold text-xs text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="skeleton h-4 rounded" style={{ width: `${50 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="font-heading text-lg font-bold text-primary mb-1">No Products Found</p>
                    <p className="font-body text-sm text-gray-400">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                products.map(product => {
                  const img = product.images?.find(x => x.isMain) || product.images?.[0];
                  const isOnSale = product.salePrice && product.salePrice < product.regularPrice;
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.includes(product._id)}
                          onChange={() => toggleSelect(product._id)}
                          className="w-4 h-4 accent-secondary rounded"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={img?.url || '/placeholder.jpg'}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-body font-semibold text-primary text-sm line-clamp-1">
                              {product.title}
                            </p>
                            <p className="font-body text-xs text-gray-400">{product.sku || 'No SKU'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-body text-xs text-gray-500 whitespace-nowrap">
                        {product.category?.name || '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div>
                          <span className="font-body font-semibold text-primary text-sm">
                            ${(isOnSale ? product.salePrice : product.regularPrice)?.toLocaleString()}
                          </span>
                          {isOnSale && (
                            <span className="font-body text-xs text-gray-400 line-through ml-1.5">
                              ${product.regularPrice?.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {isOnSale && (
                          <span className="font-body text-[10px] text-sale font-bold">
                            {product.discountPercent || Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}% OFF
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`font-body text-xs font-bold ${
                          product.stock === 0 ? 'text-sale' : product.stock < 10 ? 'text-yellow-600' : 'text-success'
                        }`}>
                          {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`font-body text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          STATUS_COLORS[product.status] || STATUS_COLORS.draft
                        }`}>
                          {product.status || 'draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/product/${product.slug}`}
                            target="_blank"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                                       hover:bg-gray-100 hover:text-primary transition-all"
                            title="View"
                          >
                            <HiEye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                                       hover:bg-secondary/10 hover:text-secondary transition-all"
                            title="Edit"
                          >
                            <HiPencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal(product)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                                       hover:bg-sale/10 hover:text-sale transition-all"
                            title="Delete"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && pagination.total > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 flex-wrap gap-3">
            <p className="font-body text-xs text-gray-400">
              Showing {(pagination.page - 1) * 15 + 1}–{Math.min(pagination.page * 15, pagination.total)} of{' '}
              <span className="font-semibold text-primary">{pagination.total}</span> products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateParams({ page: String(page - 1) })}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-200 rounded-xl font-body text-xs
                           hover:border-secondary hover:text-secondary transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="font-body text-xs text-gray-500">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => updateParams({ page: String(page + 1) })}
                disabled={page === pagination.totalPages}
                className="px-3 py-2 border border-gray-200 rounded-xl font-body text-xs
                           hover:border-secondary hover:text-secondary transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <ConfirmModal
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default AdminProducts;