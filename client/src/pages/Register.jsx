import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiCheck,
  HiX,
} from 'react-icons/hi';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password) return { score: 0, label: '', color: '', checks: {} };

    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passed = Object.values(checks).filter(Boolean).length;

    let label = '';
    let color = '';

    if (passed <= 1) {
      label = 'Very Weak';
      color = 'bg-red-500';
    } else if (passed === 2) {
      label = 'Weak';
      color = 'bg-orange-500';
    } else if (passed === 3) {
      label = 'Fair';
      color = 'bg-yellow-500';
    } else if (passed === 4) {
      label = 'Good';
      color = 'bg-blue-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }

    return { score: passed, label, color, checks };
  }, [formData.password]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors = {};

    if (touched.name && formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (touched.email && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (touched.password && formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (touched.confirmPassword && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    return errors;
  }, [formData, touched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Mark all as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Validate
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!formData.password) {
      setError('Please enter a password');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      if (result.success) {
        toast.success('Account created successfully! Welcome to LUXE FASHION! 🎉');
        navigate('/', { replace: true });
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const PasswordCheck = ({ passed, label }) => (
    <div className="flex items-center gap-2">
      {passed ? (
        <HiCheck className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <HiX className="w-3.5 h-3.5 text-gray-300" />
      )}
      <span className={`text-xs font-body ${passed ? 'text-green-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/">
              <h1 className="font-heading text-3xl font-bold text-primary">
                LUXE <span className="text-secondary">FASHION</span>
              </h1>
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-primary">
              Create Account
            </h2>
            <p className="text-gray-500 font-body mt-2">
              Join LUXE FASHION and start your style journey
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

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="label-luxe">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlineUser className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className={`input-luxe pl-11 ${
                    validationErrors.name ? 'border-sale focus:border-sale focus:ring-red-200' : ''
                  }`}
                  autoComplete="name"
                  autoFocus
                />
              </div>
              {validationErrors.name && (
                <p className="text-xs text-sale mt-1 font-body">{validationErrors.name}</p>
              )}
            </div>

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
                  onBlur={handleBlur}
                  placeholder="your@email.com"
                  className={`input-luxe pl-11 ${
                    validationErrors.email ? 'border-sale focus:border-sale focus:ring-red-200' : ''
                  }`}
                  autoComplete="email"
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-sale mt-1 font-body">{validationErrors.email}</p>
              )}
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
                  onBlur={handleBlur}
                  placeholder="Create a strong password"
                  className={`input-luxe pl-11 pr-11 ${
                    validationErrors.password ? 'border-sale focus:border-sale focus:ring-red-200' : ''
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-secondary transition-colors"
                >
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 animate-fade-in">
                  {/* Strength Bar */}
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.score
                            ? passwordStrength.color
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-body font-medium ${
                      passwordStrength.score <= 1 ? 'text-red-500' :
                      passwordStrength.score <= 2 ? 'text-orange-500' :
                      passwordStrength.score <= 3 ? 'text-yellow-600' :
                      passwordStrength.score <= 4 ? 'text-blue-500' :
                      'text-green-500'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>

                  {/* Password Requirements */}
                  <div className="grid grid-cols-2 gap-1">
                    <PasswordCheck passed={passwordStrength.checks.minLength} label="8+ characters" />
                    <PasswordCheck passed={passwordStrength.checks.hasUpperCase} label="Uppercase (A-Z)" />
                    <PasswordCheck passed={passwordStrength.checks.hasLowerCase} label="Lowercase (a-z)" />
                    <PasswordCheck passed={passwordStrength.checks.hasNumbers} label="Number (0-9)" />
                    <PasswordCheck passed={passwordStrength.checks.hasSpecial} label="Special (!@#$)" />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label-luxe">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                  className={`input-luxe pl-11 pr-11 ${
                    validationErrors.confirmPassword
                      ? 'border-sale focus:border-sale focus:ring-red-200'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-400 focus:border-green-400 focus:ring-green-200'
                      : ''
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-secondary transition-colors"
                >
                  {showConfirmPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-xs text-sale mt-1 font-body">{validationErrors.confirmPassword}</p>
              )}
              {!validationErrors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs text-green-500 mt-1 font-body flex items-center gap-1">
                  <HiCheck className="w-3.5 h-3.5" /> Passwords match
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-secondary focus:ring-secondary cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-body leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-secondary hover:text-secondary-600 font-medium underline underline-offset-2">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="text-secondary hover:text-secondary-600 font-medium underline underline-offset-2">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.agreeTerms}
              className="w-full btn-primary py-3.5 text-base font-semibold tracking-wide rounded-lg relative overflow-hidden group disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <>
                  <span className="relative z-10">Create Account</span>
                  <div className="absolute inset-0 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-4 text-xs text-gray-400 font-body uppercase tracking-wider">
              Already a member?
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600 font-body text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-secondary font-semibold hover:text-secondary-600 transition-colors underline underline-offset-4"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
          <h1 className="font-heading text-5xl font-bold text-white mb-3">
            LUXE <span className="text-secondary">FASHION</span>
          </h1>
          <div className="w-16 h-0.5 bg-secondary mb-6" />
          <p className="text-accent text-lg font-body font-light tracking-wide mb-4">
            Elegance Redefined
          </p>
          <p className="text-gray-400 text-sm font-body max-w-md leading-relaxed mb-12">
            Join thousands of stylish women who trust LUXE FASHION for their wardrobe needs.
          </p>

          {/* Benefits */}
          <div className="space-y-4 text-left max-w-sm">
            {[
              { icon: '🎁', text: 'Get 20% off your first order with code WELCOME20' },
              { icon: '🚚', text: 'Free shipping on orders over $50' },
              { icon: '🔄', text: 'Easy 30-day returns on all products' },
              { icon: '✨', text: 'Exclusive access to member-only deals' },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-lg">{benefit.icon}</span>
                <span className="text-gray-300 text-sm font-body">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;