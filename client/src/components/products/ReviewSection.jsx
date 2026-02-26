import React, { useState, useEffect } from 'react';
import { HiStar, HiUser, HiCheckCircle } from 'react-icons/hi';
import api from '../../utils/api';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const StarInput = ({ value, onChange, size = 'md' }) => {
  const [hover, setHover] = useState(0);
  const sz = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <HiStar
            className={`${sz} transition-colors ${
              star <= (hover || value) ? 'text-yellow-400' : 'text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const stars = review.rating || 0;
  return (
    <div className="bg-white rounded-xl p-5 shadow-luxe">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <HiUser className="w-5 h-5 text-primary/50" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-body font-semibold text-primary text-sm">
              {review.user?.name || 'Customer'}
            </span>
            <span className="font-body text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {[1,2,3,4,5].map(s => (
              <HiStar key={s} className={`w-3.5 h-3.5 ${s <= stars ? 'text-yellow-400' : 'text-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>

      {review.title && (
        <h4 className="font-body font-semibold text-primary text-sm mb-1">{review.title}</h4>
      )}
      <p className="font-body text-gray-600 text-sm leading-relaxed">{review.comment}</p>

      {/* Verified badge */}
      <div className="flex items-center gap-1 mt-3">
        <HiCheckCircle className="w-3.5 h-3.5 text-success" />
        <span className="font-body text-xs text-success">Verified Purchase</span>
      </div>

      {/* Admin Reply */}
      {review.adminReply && (
        <div className="mt-3 bg-accent/30 rounded-xl p-3 border border-accent">
          <p className="font-body text-xs font-semibold text-secondary mb-1">💬 Response from LUXE FASHION:</p>
          <p className="font-body text-xs text-gray-600">{review.adminReply}</p>
        </div>
      )}
    </div>
  );
};

const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs font-body">
      <span className="w-4 text-right text-gray-500">{star}</span>
      <HiStar className="w-3 h-3 text-yellow-400 flex-shrink-0" />
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-yellow-400 h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-gray-400">{count}</span>
    </div>
  );
};

const ReviewSection = ({ productId, ratings }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: '', comment: '' });
  const [ratingDist, setRatingDist] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/product/${productId}`);
        if (data.success) {
          setReviews(data.reviews || []);
          // Compute distribution
          const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          (data.reviews || []).forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
          setRatingDist(dist);
        }
      } catch (err) { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error('Please select a rating'); return; }
    if (!form.comment.trim()) { toast.error('Please write a review'); return; }
    try {
      setSubmitting(true);
      const { data } = await api.post('/reviews', {
        product: productId,
        rating: form.rating,
        title: form.title,
        comment: form.comment,
      });
      if (data.success) {
        toast.success('Review submitted! It will appear after approval.');
        setForm({ rating: 0, title: '', comment: '' });
        setShowForm(false);
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const total = reviews.length;
  const avg = ratings?.average || 0;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-2xl shadow-luxe p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Average */}
          <div className="text-center flex-shrink-0">
            <div className="font-heading text-5xl font-bold text-primary leading-none">{avg.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-0.5 my-2">
              {[1,2,3,4,5].map(s => (
                <HiStar key={s} className={`w-5 h-5 ${s <= Math.round(avg) ? 'text-yellow-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <div className="font-body text-xs text-gray-400">{total} reviews</div>
          </div>

          {/* Distribution */}
          <div className="flex-1 w-full space-y-1.5">
            {[5,4,3,2,1].map(star => (
              <RatingBar key={star} star={star} count={ratingDist[star]} total={total} />
            ))}
          </div>
        </div>

        {/* Write Review CTA */}
        <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <p className="font-body text-sm text-gray-500">Purchased this product? Share your experience!</p>
          {isAuthenticated ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-body font-semibold text-sm
                         hover:bg-secondary transition-colors duration-300 shadow-luxe"
            >
              {showForm ? 'Cancel' : '✍️ Write a Review'}
            </button>
          ) : (
            <a href="/login" className="px-5 py-2.5 bg-primary text-white rounded-xl font-body font-semibold text-sm
                                       hover:bg-secondary transition-colors duration-300 shadow-luxe">
              Login to Review
            </a>
          )}
        </div>

        {/* Review Form */}
        {showForm && isAuthenticated && (
          <form onSubmit={handleSubmit} className="mt-5 pt-5 border-t border-gray-100 space-y-4 animate-fade-in-up">
            <div>
              <label className="block font-body text-sm font-semibold text-primary mb-2">Your Rating *</label>
              <StarInput value={form.rating} onChange={val => setForm(f => ({ ...f, rating: val }))} size="lg" />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-primary mb-1.5">Title (Optional)</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Summarize your review..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm
                           focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-primary mb-1.5">Your Review *</label>
              <textarea
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Tell others about your experience with this product..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm
                           focus:outline-none focus:border-secondary transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-primary text-white rounded-xl font-body font-semibold text-sm
                         hover:bg-secondary transition-colors duration-300 disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
              ) : 'Submit Review'}
            </button>
          </form>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-luxe space-y-2">
              <div className="skeleton h-4 w-1/3 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">⭐</div>
          <h4 className="font-heading text-xl font-bold text-primary mb-2">No Reviews Yet</h4>
          <p className="font-body text-gray-500 text-sm">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;