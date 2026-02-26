import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiLockClosed, HiMail, HiEye, HiEyeOff } from 'react-icons/hi';
import api from '../../utils/api';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/admin';

  useEffect(() => {
    if (isAuthenticated && isAdmin) navigate('/admin', { replace: true });
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', form);
      if (data.success) {
        localStorage.setItem('luxe_token', data.token);
        localStorage.setItem('luxe_user', JSON.stringify(data.user));
        // Reload to trigger AuthContext
        window.location.href = '/admin';
      }
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/80 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C4A35A 0, #C4A35A 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/20 border border-secondary/30 mb-4">
            <HiLockClosed className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">LUXE FASHION</h1>
          <p className="font-body text-secondary/80 text-sm mt-1 tracking-widest uppercase">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-luxe-xl">
          <h2 className="font-heading text-xl font-bold text-white mb-6 text-center">Sign In to Admin</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block font-body text-sm font-semibold text-white/80 mb-1">Email</label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="admin@luxefashion.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl font-body text-sm text-white placeholder-white/40 focus:outline-none focus:border-secondary/60 focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-body text-sm font-semibold text-white/80 mb-1">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl font-body text-sm text-white placeholder-white/40 focus:outline-none focus:border-secondary/60 focus:ring-2 focus:ring-secondary/20"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                  {showPw ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-secondary text-white rounded-xl font-body font-semibold text-sm hover:bg-secondary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2 shadow-gold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <HiLockClosed className="w-4 h-4" />
                  Sign In to Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Default Credentials hint */}
          <div className="mt-5 p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="font-body text-xs text-white/50 text-center">Default: admin@luxefashion.com / Admin@123</p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-5">
          <a href="/" className="font-body text-sm text-white/50 hover:text-white/70 transition-colors">
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;