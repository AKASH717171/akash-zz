import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('luxe_remember_email');
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password, formData.rememberMe);

      if (result.success) {
        toast.success('Welcome back! 🎉');
        navigate(from, { replace: true });
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200)',
          }}
        />

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          <h1 className="font-heading text-5xl font-bold text-white mb-3">
            LUXE <span className="text-secondary">FASHION</span>
          </h1>
          <div className="w-16 h-0.5 bg-secondary mb-6" />
          <p className="text-accent text-lg font-body font-light tracking-wide">
            Elegance Redefined
          </p>
          <p className="text-gray-400 text-sm font-body mt-4 max-w-md leading-relaxed">
            Discover curated collections of premium women's fashion, bags, and shoes designed to make you feel extraordinary.
          </p>

          {/* Decorative Elements */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex items-center gap-6 text-gray-500 text-xs font-body tracking-widest uppercase">
            <span>Fashion</span>
            <span className="w-1 h-1 bg-secondary rounded-full" />
            <span>Bags</span>
            <span className="w-1 h-1 bg-secondary rounded-full" />
            <span>Shoes</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/">
              <h1 className="font-heading text-3xl font-bold text-primary">
                LUXE <span className="text-secondary">FASHION</span>
              </h1>
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-primary">
              Welcome Back
            </h2>
            <p className="text-gray-500 font-body mt-2">
              Sign in to your account to continue shopping
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-scale-in">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sale flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-sale font-body">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label-luxe">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlineMail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="input-luxe pl-11"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label-luxe">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input-luxe pl-11 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-secondary transition-colors"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-body group-hover:text-dark transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-secondary hover:text-secondary-600 font-medium font-body transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base font-semibold tracking-wide rounded-lg relative overflow-hidden group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                <>
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-4 text-xs text-gray-400 font-body uppercase tracking-wider">
              New here?
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600 font-body text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-secondary font-semibold hover:text-secondary-600 transition-colors underline underline-offset-4"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-accent-50 rounded-lg border border-accent-200">
            <p className="text-xs text-gray-500 font-body font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-600 font-body">
                <span className="font-medium">Admin:</span> admin@luxefashion.com / Admin@123
              </p>
              <p className="text-xs text-gray-600 font-body">
                <span className="font-medium">Customer:</span> customer@luxefashion.com / Customer@123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;