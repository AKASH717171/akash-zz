import React, { useState } from 'react';
import { HiOutlineMail, HiOutlineGift, HiCheck } from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/newsletter/subscribe', {
        email: email.trim(),
        source: 'homepage',
      });
      if (data.success) {
        setSubscribed(true);
        setEmail('');
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-luxe" />
      <div className="absolute inset-0 bg-pattern opacity-20" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 container-luxe py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 animate-float">
            <HiOutlineMail className="w-8 h-8 text-secondary" />
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">
            Join the <span className="text-gradient-gold">LUXE</span> Family
          </h2>
          <p className="text-gray-400 font-body text-sm sm:text-base mb-8 max-w-md mx-auto">
            Subscribe for exclusive offers, early access to new arrivals, and styling tips delivered to your inbox.
          </p>

          {subscribed ? (
            <div className="animate-scale-in bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <HiCheck className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">Welcome to the Family! 🎉</h3>
              <p className="text-gray-400 font-body text-sm">
                You've been subscribed. Check your inbox for a special welcome gift!
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6">
                <div className="relative flex-1">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white
                               placeholder-gray-400 text-sm font-body
                               focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20
                               transition-all duration-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn bg-secondary text-white hover:bg-secondary-600 py-4 px-8 rounded-xl text-sm font-semibold
                             shadow-gold hover:shadow-gold-lg transition-all duration-300 whitespace-nowrap
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Subscribing...
                    </span>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </form>

              {/* Benefits */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {[
                  { icon: '🎁', text: 'Exclusive offers' },
                  { icon: '🆕', text: 'Early access' },
                  { icon: '📖', text: 'Style tips' },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-1.5">
                    <span className="text-sm">{b.icon}</span>
                    <span className="text-xs text-gray-400 font-body">{b.text}</span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-gray-600 font-body mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;