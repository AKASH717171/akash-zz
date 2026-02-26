import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiHome, HiSearch, HiShoppingBag, HiArrowRight } from 'react-icons/hi';

const QUICK_LINKS = [
  { label: 'Women Fashion', href: '/category/women-fashion', emoji: '👗' },
  { label: 'Bags', href: '/category/bags', emoji: '👜' },
  { label: 'Shoes', href: '/category/shoes', emoji: '👠' },
  { label: 'New Arrivals', href: '/shop?sort=newest', emoji: '✨' },
  { label: 'Sale', href: '/shop?sort=discount', emoji: '🏷️' },
];

const NotFound = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/80 flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center">

        {/* 404 Graphic */}
        <div className="relative inline-block mb-8">
          <div className="font-heading text-[120px] md:text-[160px] font-bold leading-none
                         text-white/5 select-none animate-pulse-gold">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-secondary/20 rounded-full p-6 animate-float">
              <div className="text-6xl md:text-7xl">👗</div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="font-heading text-2xl md:text-4xl font-bold text-white mb-3 animate-fade-in">
          Oops! Page Not Found
        </h1>
        <p className="font-body text-white/60 text-sm md:text-base mb-8 animate-fade-in-up leading-relaxed">
          The page you're looking for seems to have gone on a fashion trip.
          Let's get you back on track!
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8 animate-fade-in-up">
          <div className="relative max-w-md mx-auto">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full bg-white text-primary rounded-2xl pl-12 pr-14 py-4 font-body text-sm
                         focus:outline-none focus:ring-2 focus:ring-secondary shadow-luxe-xl"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-secondary
                         text-white rounded-xl flex items-center justify-center hover:bg-secondary-600
                         transition-colors"
            >
              <HiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 animate-fade-in-up">
          <Link
            to="/"
            className="flex items-center gap-2 px-7 py-3.5 bg-white text-primary rounded-xl
                       font-body font-bold hover:bg-accent transition-colors shadow-luxe-xl"
          >
            <HiHome className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/shop"
            className="flex items-center gap-2 px-7 py-3.5 bg-secondary text-white rounded-xl
                       font-body font-bold hover:bg-secondary-600 transition-colors shadow-gold"
          >
            <HiShoppingBag className="w-4 h-4" />
            Browse Shop
          </Link>
        </div>

        {/* Quick Links */}
        <div className="animate-fade-in-up">
          <p className="font-body text-white/40 text-xs uppercase tracking-widest mb-4">
            Popular Categories
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {QUICK_LINKS.map(({ label, href, emoji }) => (
              <Link
                key={label}
                to={href}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20
                           text-white rounded-full font-body text-xs font-semibold transition-colors
                           backdrop-blur-sm border border-white/10 hover:border-white/20"
              >
                <span>{emoji}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Fun message */}
        <p className="font-body text-white/30 text-xs mt-8 animate-fade-in">
          Error Code: 404 — We promise our clothes are easier to find than this page 😄
        </p>
      </div>
    </div>
  );
};

export default NotFound;