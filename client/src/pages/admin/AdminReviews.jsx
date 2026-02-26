import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiStar, HiCheck, HiX, HiTrash, HiReply, HiFilter } from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STAR_COLORS = { 5: 'text-yellow-400', 4: 'text-yellow-400', 3: 'text-orange-400', 2: 'text-orange-500', 1: 'text-red-500' };
const STATUS_BADGE = {
  pending:  'bg-yellow-100 text-yellow-700 border border-yellow-200',
  approved: 'bg-green-100 text-green-700 border border-green-200',
  rejected: 'bg-red-100 text-red-600 border border-red-200',
};

const Stars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <HiStar key={i} className={`w-4 h-4 ${i <= rating ? STAR_COLORS[rating] || 'text-yellow-400' : 'text-gray-300'}`} />
    ))}
  </div>
);

// ── Reply Modal ───────────────────────────────────────────────────────────
const ReplyModal = ({ review, onClose, onSave }) => {
  const [text, setText] = useState(review.adminReply?.text || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return toast.error('Reply cannot be empty');
    setSaving(true);
    try {
      await api.put(`/reviews/${review._id}/reply`, { reply: text.trim() });
      toast.success('Reply saved!');
      onSave();
    } catch { toast.error('Failed to save reply'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-luxe-xl w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-heading text-lg font-bold text-primary">Reply to Review</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Original Review */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Stars rating={review.rating} />
              <span className="font-body text-sm text-gray-500">by {review.user?.name || 'Customer'}</span>
            </div>
            {review.title && <p className="font-body text-sm font-semibold text-primary mb-1">{review.title}</p>}
            <p className="font-body text-sm text-gray-600">{review.comment}</p>
          </div>
          {/* Reply */}
          <div>
            <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Your Reply</label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your reply..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-body text-sm font-semibold text-gray-600">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 bg-secondary text-white rounded-xl font-body text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────
const AdminReviews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [replyReview, setReplyReview] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (status) params.set('status', status);
      const { data } = await api.get(`/reviews/admin/all?${params}`);
      if (data.success) {
        setReviews(data.reviews || []);
        setPagination({ page: data.currentPage || 1, totalPages: data.totalPages || 1, total: data.total || 0 });
      }
    } catch { toast.error('Failed to fetch reviews'); }
    finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const updateStatus = async (id, newStatus) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await api.put(`/reviews/${id}/status`, { status: newStatus });
      toast.success(`Review ${newStatus}!`);
      setReviews((prev) => prev.map((r) => r._id === id ? { ...r, status: newStatus } : r));
    } catch { toast.error('Failed to update review'); }
    finally { setActionLoading((prev) => ({ ...prev, [id]: false })); }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch { toast.error('Delete failed'); }
    finally { setActionLoading((prev) => ({ ...prev, [id]: false })); }
  };

  const updateParams = (updates) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    p.set('page', '1');
    setSearchParams(p);
  };

  const STATUS_FILTERS = ['', 'pending', 'approved', 'rejected'];

  return (
    <div className="space-y-5">
      {replyReview && (
        <ReplyModal review={replyReview} onClose={() => setReplyReview(null)}
          onSave={() => { setReplyReview(null); fetchReviews(); }} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary">Reviews</h2>
          <p className="font-body text-sm text-gray-400">{loading ? '...' : `${pagination.total} total reviews`}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-luxe p-1 flex gap-1 w-fit">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => updateParams({ status: s })}
            className={`px-4 py-2 rounded-xl font-body text-sm font-semibold transition-colors capitalize ${
              status === s ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <HiStar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-body text-gray-400">No reviews found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((r) => (
              <div key={r._id} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-wrap items-start gap-4">
                  {/* Product */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {r.product?.images?.[0]?.url && (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={r.product.images[0].url} alt={r.product.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-body text-sm font-semibold text-primary truncate">{r.product?.title || 'Unknown Product'}</p>
                      <p className="font-body text-xs text-gray-400">{r.user?.name || 'Anonymous'} · {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Rating + Status */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Stars rating={r.rating} />
                    <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[r.status] || STATUS_BADGE.pending}`}>
                      {r.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {r.status !== 'approved' && (
                      <button
                        onClick={() => updateStatus(r._id, 'approved')}
                        disabled={actionLoading[r._id]}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-green-600 disabled:opacity-40"
                        title="Approve"
                      >
                        <HiCheck className="w-4 h-4" />
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(r._id, 'rejected')}
                        disabled={actionLoading[r._id]}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-red-500 disabled:opacity-40"
                        title="Reject"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setReplyReview(r)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-blue-500"
                      title="Reply"
                    >
                      <HiReply className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteReview(r._id)}
                      disabled={actionLoading[r._id]}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-red-400 disabled:opacity-40"
                      title="Delete"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mt-3 ml-0">
                  {r.title && <p className="font-body text-sm font-semibold text-primary mb-1">{r.title}</p>}
                  <p className="font-body text-sm text-gray-600 leading-relaxed">{r.comment}</p>

                  {/* Admin Reply */}
                  {r.adminReply?.text && (
                    <div className="mt-3 pl-3 border-l-2 border-secondary/40">
                      <p className="font-body text-xs font-semibold text-secondary mb-0.5">LUXE FASHION Reply:</p>
                      <p className="font-body text-sm text-gray-600">{r.adminReply.text}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="font-body text-sm text-gray-400">Page {pagination.page} of {pagination.totalPages}</span>
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

export default AdminReviews;