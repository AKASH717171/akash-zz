import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiCog,
  HiOutlineClipboardList,
  HiOutlineChevronDown,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Women Fashion', path: '/shop?category=women-fashion' },
    { name: 'Bags', path: '/shop?category=bags' },
    { name: 'Shoes', path: '/shop?category=shoes' },
  ];

  // Don't show header on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-white text-center py-2 text-xs sm:text-sm font-body tracking-wide">
        <p>✨ Free Shipping on Orders Over $50 | Use Code <span className="text-secondary font-semibold">WELCOME20</span> for 20% Off ✨</p>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          scrolled ? 'shadow-luxe' : 'border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-primary hover:text-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="font-heading text-2xl lg:text-3xl font-bold text-primary tracking-wider">
                LUXE <span className="text-secondary">FASHION</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-body text-sm font-medium tracking-wide transition-colors duration-300 pb-1 border-b-2 ${
                    location.pathname === link.path
                      ? 'text-secondary border-secondary'
                      : 'text-dark border-transparent hover:text-secondary hover:border-secondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
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
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-white shadow-luxe-lg rounded-lg p-4 animate-fade-in-down z-50">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="input-luxe text-sm"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="btn-secondary py-2 px-4 text-sm rounded-lg"
                      >
                        Search
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                to={isAuthenticated ? '/account/wishlist' : '/login'}
                className="p-2 text-primary hover:text-secondary transition-colors relative"
                aria-label="Wishlist"
              >
                <HiOutlineHeart className="w-5 h-5" />
                {isAuthenticated && user?.wishlist?.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-sale text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {user.wishlist.length}
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
                <span className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>

              {/* User Account */}
              {isAuthenticated ? (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1 p-2 text-primary hover:text-secondary transition-colors"
                    aria-label="Account menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-secondary">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <HiOutlineChevronDown className={`w-3 h-3 hidden sm:block transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-luxe-lg py-2 animate-fade-in-down z-50 border border-gray-100">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-heading font-semibold text-primary truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/account"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-accent-50 hover:text-secondary transition-colors"
                        >
                          <HiOutlineUser className="w-4 h-4" />
                          My Dashboard
                        </Link>
                        <Link
                          to="/account/orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-accent-50 hover:text-secondary transition-colors"
                        >
                          <HiOutlineClipboardList className="w-4 h-4" />
                          My Orders
                        </Link>
                        <Link
                          to="/account/wishlist"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-accent-50 hover:text-secondary transition-colors"
                        >
                          <HiOutlineHeart className="w-4 h-4" />
                          Wishlist
                        </Link>
                        <Link
                          to="/account/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-accent-50 hover:text-secondary transition-colors"
                        >
                          <HiCog className="w-4 h-4" />
                          Settings
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary font-medium hover:bg-accent-50 transition-colors border-t border-gray-100 mt-1 pt-2"
                          >
                            <HiCog className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-sale hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <HiOutlineLogout className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-primary hover:text-secondary transition-colors"
                  aria-label="Login"
                >
                  <HiOutlineUser className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 animate-fade-in-down">
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block py-3 px-4 rounded-lg font-body text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'bg-primary text-secondary'
                      : 'text-dark hover:bg-accent-50 hover:text-secondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <Link to="/login" className="block">
                    <button className="btn-primary w-full text-sm">Login</button>
                  </Link>
                  <Link to="/register" className="block">
                    <button className="btn-outline w-full text-sm">Register</button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;