import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser,
  HiOutlineSearch, HiOutlineMenu, HiOutlineX,
  HiOutlineLogout, HiCog, HiOutlineClipboardList,
  HiOutlineChevronDown, HiOutlineHome,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';

const CATEGORIES = [
  {
    name: 'Women Fashion',
    slug: 'women-fashion',
    subs: [
      { name: 'Dresses', slug: 'dresses' },
      { name: 'Tops & Blouses', slug: 'tops-blouses' },
      { name: 'Skirts', slug: 'skirts' },
      { name: 'Traditional Wear', slug: 'traditional-wear' },
      { name: 'Jackets & Coats', slug: 'jackets-coats' },
    ],
  },
  {
    name: 'Bags',
    slug: 'bags',
    subs: [
      { name: 'Handbags', slug: 'handbags' },
      { name: 'Tote Bags', slug: 'tote-bags' },
      { name: 'Clutches', slug: 'clutches' },
      { name: 'Crossbody Bags', slug: 'crossbody-bags' },
      { name: 'Backpacks', slug: 'backpacks' },
    ],
  },
  {
    name: 'Shoes',
    slug: 'shoes',
    subs: [
      { name: 'Heels', slug: 'heels' },
      { name: 'Flats', slug: 'flats' },
      { name: 'Sneakers', slug: 'sneakers' },
      { name: 'Boots', slug: 'boots' },
      { name: 'Sandals', slug: 'sandals' },
    ],
  },
];

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDrop, setUserDrop] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const userRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserDrop(false);
    setSearchOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserDrop(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  }, [searchQuery, navigate]);

  const handleLogout = () => {
    logout();
    setUserDrop(false);
    navigate('/');
  };

  const wishlistCount = user?.wishlist?.length || 0;

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? 'shadow-luxe-md' : 'border-b border-gray-100'
      }`}
    >
      <div className="container-luxe">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 -ml-2 text-primary hover:text-secondary transition-colors"
            aria-label="Menu"
          >
            <HiOutlineMenu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <h1 className="font-heading text-xl sm:text-2xl lg:text-[1.7rem] font-bold tracking-wider text-primary select-none">
              LUXE <span className="text-secondary">FASHION</span>
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-body font-medium transition-colors rounded-lg ${
                location.pathname === '/' ? 'text-secondary' : 'text-dark hover:text-secondary'
              }`}
            >
              Home
            </Link>

            {CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                className="relative"
                onMouseEnter={() => setActiveDropdown(cat.slug)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-body font-medium transition-colors rounded-lg ${
                    location.search.includes(cat.slug) ? 'text-secondary' : 'text-dark hover:text-secondary'
                  }`}
                >
                  {cat.name}
                  <HiOutlineChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === cat.slug ? 'rotate-180' : ''
                  }`} />
                </Link>

                {/* Dropdown */}
                {activeDropdown === cat.slug && (
                  <div className="absolute top-full left-0 mt-0 pt-2 z-50">
                    <div className="bg-white rounded-xl shadow-luxe-lg border border-gray-100 py-2 w-56 animate-fade-in-down">
                      <Link
                        to={`/shop?category=${cat.slug}`}
                        className="block px-5 py-2.5 text-sm font-body font-semibold text-primary hover:bg-accent-50 hover:text-secondary transition-colors"
                      >
                        All {cat.name}
                      </Link>
                      <div className="h-px bg-gray-100 my-1" />
                      {cat.subs.map((sub) => (
                        <Link
                          key={sub.slug}
                          to={`/shop?category=${cat.slug}&sub=${sub.slug}`}
                          className="block px-5 py-2.5 text-sm font-body text-gray-600 hover:bg-accent-50 hover:text-secondary transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/shop?sale=true"
              className="px-4 py-2 text-sm font-body font-semibold text-sale hover:text-red-700 transition-colors rounded-lg"
            >
              Sale
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-primary hover:text-secondary transition-colors"
                aria-label="Search"
              >
                <HiOutlineSearch className="w-5 h-5" />
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-xl shadow-luxe-xl p-4 animate-fade-in-down z-60 border border-gray-100" style={{maxWidth: '400px'}}>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="input-luxe text-sm flex-1"
                      autoFocus
                    />
                    <button type="submit" className="btn-secondary btn-sm rounded-lg">
                      Search
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to={isAuthenticated ? '/account/wishlist' : '/login'}
              className="p-2 text-primary hover:text-secondary transition-colors relative hidden sm:block"
              aria-label="Wishlist"
            >
              <HiOutlineHeart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sale text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-primary hover:text-secondary transition-colors relative"
              aria-label="Cart"
            >
              <HiOutlineShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserDrop(!userDrop)}
                  className="flex items-center gap-1.5 p-1.5 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-secondary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <HiOutlineChevronDown className={`w-3 h-3 text-gray-400 hidden sm:block transition-transform ${userDrop ? 'rotate-180' : ''}`} />
                </button>

                {userDrop && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-luxe-xl border border-gray-100 py-1 animate-fade-in-down z-60">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-heading font-semibold text-primary text-sm truncate">{user?.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link to="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-accent-50 hover:text-secondary transition-colors">
                      <HiOutlineHome className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-accent-50 hover:text-secondary transition-colors">
                      <HiOutlineClipboardList className="w-4 h-4" /> My Orders
                    </Link>
                    <Link to="/account/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-accent-50 hover:text-secondary transition-colors">
                      <HiOutlineHeart className="w-4 h-4" /> Wishlist
                    </Link>
                    <Link to="/account/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-accent-50 hover:text-secondary transition-colors">
                      <HiCog className="w-4 h-4" /> Settings
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="h-px bg-gray-100 my-1" />
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary font-medium hover:bg-accent-50 transition-colors">
                          <HiCog className="w-4 h-4" /> Admin Panel
                        </Link>
                      </>
                    )}
                    <div className="h-px bg-gray-100 my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-sale hover:bg-red-50 transition-colors w-full text-left">
                      <HiOutlineLogout className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="p-2 text-primary hover:text-secondary transition-colors" aria-label="Login">
                <HiOutlineUser className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ===== MOBILE SIDEBAR ===== */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-60 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-70 shadow-luxe-xl animate-slide-in-left overflow-y-auto lg:hidden">
            {/* Mobile header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-heading text-xl font-bold text-primary">
                LUXE <span className="text-secondary">FASHION</span>
              </h2>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-500 hover:text-primary">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile nav */}
            <nav className="px-4 py-4">
              <Link to="/" className="block py-3 px-4 text-sm font-body font-medium text-dark hover:text-secondary hover:bg-accent-50 rounded-lg">
                Home
              </Link>
              <Link to="/shop" className="block py-3 px-4 text-sm font-body font-medium text-dark hover:text-secondary hover:bg-accent-50 rounded-lg">
                Shop All
              </Link>

              {CATEGORIES.map((cat) => (
                <div key={cat.slug} className="mt-1">
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="block py-3 px-4 text-sm font-body font-semibold text-primary hover:text-secondary hover:bg-accent-50 rounded-lg"
                  >
                    {cat.name}
                  </Link>
                  <div className="ml-4 border-l-2 border-accent-200 pl-3">
                    {cat.subs.map((sub) => (
                      <Link
                        key={sub.slug}
                        to={`/shop?category=${cat.slug}&sub=${sub.slug}`}
                        className="block py-2 px-3 text-xs font-body text-gray-500 hover:text-secondary transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <Link to="/shop?sale=true" className="block py-3 px-4 text-sm font-body font-semibold text-sale hover:bg-red-50 rounded-lg mt-2">
                🔥 Sale
              </Link>

              <div className="h-px bg-gray-100 my-4" />

              {!isAuthenticated ? (
                <div className="space-y-2 px-4">
                  <Link to="/login" className="block"><button className="btn-primary w-full text-sm">Login</button></Link>
                  <Link to="/register" className="block"><button className="btn-outline w-full text-sm">Register</button></Link>
                </div>
              ) : (
                <div className="px-4">
                  <Link to="/account" className="block py-2 text-sm text-dark hover:text-secondary">My Account</Link>
                  <Link to="/account/orders" className="block py-2 text-sm text-dark hover:text-secondary">Orders</Link>
                  <button onClick={handleLogout} className="block py-2 text-sm text-sale w-full text-left">Logout</button>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;