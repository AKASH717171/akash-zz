import React, { useState, useEffect, useCallback } from 'react';
import {
  HiPlus, HiPencil, HiTrash, HiX, HiTicket,
  HiCheckCircle, HiXCircle, HiDuplicate,
} from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  active:   'bg-green-100 text-green-700 border border-green-200',
  inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
  expired:  'bg-red-100 text-red-600 border border-red-200',
};

const fmtDate = (d) => d ? new Date(d).toISOString().slice(0, 10) : '';
const isExpired = (d) => d && new Date(d) < new Date();

const EMPTY_FORM = {
  code: '', discountType: 'percentage', discountValue: '',
  minOrderAmount: '', maxDiscount: '', usageLimit: '', perUserLimit: 1,
  startDate: fmtDate(new Date()), expiryDate: '', status: 'active',
};

// ── Coupon Form Modal ────────────────────────────────────────────────────
const CouponModal = ({ coupon, onClose, onSave }) => {
  const [form, setForm] = useState(coupon ? {
    ...EMPTY_FORM, ...coupon,
    startDate: fmtDate(coupon.startDate),
    expiryDate: fmtDate(coupon.expiryDate),
    discountValue: coupon.discountValue ?? '',
    minOrderAmount: coupon.minOrderAmount ?? '',
    maxDiscount: coupon.maxDiscount ?? '',
    usageLimit: coupon.usageLimit ?? '',
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) return toast.error('Code and value required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount === '' ? 0 : Number(form.minOrderAmount),
        maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
        usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
        perUserLimit: Number(form.perUserLimit) || 1,
      };
      if (coupon?._id) {
        await api.put(`/coupons/${coupon._id}`, payload);
        toast.success('Coupon updated!');
      } else {
        await api.post('/coupons', payload);
        toast.success('Coupon created!');
      }
      onSave();
    } catch (err) { toast.error(err.message || 'Failed to save coupon'); }
    finally { setSaving(false); }
  };

  const INPUT = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-secondary/60 focus:ring-2 focus:ring-secondary/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-luxe-xl w-full max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-heading text-lg font-bold text-primary">
            {coupon ? 'Edit Coupon' : 'Create Coupon'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Code */}
          <div>
            <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Coupon Code *</label>
            <div className="flex gap-2">
              <input
                className={`${INPUT} flex-1 uppercase`}
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                placeholder="e.g. LUXE80"
                required
              />
              <button type="button"
                onClick={() => set('code', Math.random().toString(36).substring(2, 8).toUpperCase())}
                className="px-3 py-2.5 border border-gray-200 rounded-xl font-body text-xs text-gray-600 hover:border-gray-300 transition-colors"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Discount Type *</label>
              <select className={INPUT} value={form.discountType} onChange={(e) => set('discountType', e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">
                Value * {form.discountType === 'percentage' ? '(%)' : '($)'}
              </label>
              <input
                type="number" min="0" max={form.discountType === 'percentage' ? 100 : undefined}
                className={INPUT} value={form.discountValue}
                onChange={(e) => set('discountValue', e.target.value)}
                placeholder={form.discountType === 'percentage' ? '80' : '500'}
                required
              />
            </div>
          </div>

          {/* Min Amount + Max Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Min Order Amount ($)</label>
              <input type="number" min="0" className={INPUT} value={form.minOrderAmount}
                onChange={(e) => set('minOrderAmount', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Max Discount ($)</label>
              <input type="number" min="0" className={INPUT} value={form.maxDiscount}
                onChange={(e) => set('maxDiscount', e.target.value)} placeholder="Unlimited" />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Total Usage Limit</label>
              <input type="number" min="1" className={INPUT} value={form.usageLimit}
                onChange={(e) => set('usageLimit', e.target.value)} placeholder="Unlimited" />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Per User Limit</label>
              <input type="number" min="1" className={INPUT} value={form.perUserLimit}
                onChange={(e) => set('perUserLimit', e.target.value)} placeholder="1" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Start Date</label>
              <input type="date" className={INPUT} value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)} />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
              <input type="date" className={INPUT} value={form.expiryDate}
                onChange={(e) => set('expiryDate', e.target.value)} />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select className={INPUT} value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl font-body text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-secondary text-white rounded-xl font-body text-sm font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {coupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Confirm ───────────────────────────────────────────────────────
const ConfirmModal = ({ onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-luxe-xl p-6 w-full max-w-sm animate-scale-in text-center">
      <div className="w-14 h-14 bg-sale/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <HiTrash className="w-7 h-7 text-sale" />
      </div>
      <h3 className="font-heading text-lg font-bold text-primary mb-2">Delete Coupon?</h3>
      <p className="font-body text-sm text-gray-500 mb-6">This action cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-body text-sm font-semibold text-gray-600">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 bg-sale text-white rounded-xl font-body text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Main ─────────────────────────────────────────────────────────────────
const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCoupon, setModalCoupon] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons/admin/all');
      if (data.success) setCoupons(data.coupons || []);
    } catch { toast.error('Failed to fetch coupons'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/coupons/${deleteId}`);
      toast.success('Coupon deleted');
      setDeleteId(null);
      fetchCoupons();
    } catch (err) { toast.error(err.message || 'Delete failed'); }
    finally { setDeleting(false); }
  };

  const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success(`Copied: ${code}`); };

  const getCouponStatus = (c) => {
    if (isExpired(c.expiryDate)) return 'expired';
    return c.status;
  };

  return (
    <div className="space-y-5">
      {modalCoupon !== undefined && (
        <CouponModal
          coupon={modalCoupon}
          onClose={() => setModalCoupon(undefined)}
          onSave={() => { setModalCoupon(undefined); fetchCoupons(); }}
        />
      )}
      {deleteId && <ConfirmModal onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary">Coupons</h2>
          <p className="font-body text-sm text-gray-400">{coupons.length} total coupons</p>
        </div>
        <button onClick={() => setModalCoupon(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-body text-sm font-semibold hover:bg-secondary/90 transition-colors shadow-gold">
          <HiPlus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <HiTicket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-body text-gray-400">No coupons yet</p>
            <button onClick={() => setModalCoupon(null)} className="mt-3 text-secondary font-body text-sm font-semibold hover:underline">
              Create your first coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Code', 'Type', 'Value', 'Min Order', 'Usage', 'Expiry', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((c) => {
                  const status = getCouponStatus(c);
                  return (
                    <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-body font-bold text-sm text-primary bg-accent/40 px-2 py-0.5 rounded-lg tracking-wider">
                            {c.code}
                          </span>
                          <button onClick={() => copyCode(c.code)} className="text-gray-400 hover:text-secondary transition-colors">
                            <HiDuplicate className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-gray-600 capitalize">{c.discountType}</td>
                      <td className="px-4 py-3 font-heading font-bold text-sm text-secondary">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-gray-500">
                        {c.minOrderAmount ? `$${c.minOrderAmount}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-body text-sm text-gray-600">
                          {c.usedCount || 0}
                          {c.usageLimit ? ` / ${c.usageLimit}` : ' / ∞'}
                        </div>
                        {c.usageLimit && (
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                            <div
                              className="h-1.5 bg-secondary rounded-full"
                              style={{ width: `${Math.min(100, ((c.usedCount || 0) / c.usageLimit) * 100)}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-gray-500 whitespace-nowrap">
                        {c.expiryDate ? (
                          <span className={isExpired(c.expiryDate) ? 'text-sale' : 'text-gray-600'}>
                            {new Date(c.expiryDate).toLocaleDateString()}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[status] || STATUS_BADGE.inactive}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setModalCoupon(c)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-colors text-blue-500">
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(c._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-red-400">
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;