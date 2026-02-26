import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiSearch, HiX, HiClock, HiTrendingUp } from 'react-icons/hi';
import api from '../../utils/api';

const TRENDING = ['Summer Dress', 'Handbag', 'Kurti', 'Sandals', 'Saree', 'Party Wear'];
const MAX_RECENT = 5;

const SearchOverlay = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const debounceRef = useRef(null);

  // Load recent searches
  useEffect(() => {
    try {
      const saved = localStorage.getItem('luxe_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      setSuggestions([]);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(query)}&limit=5`);
        if (data.success) setSuggestions(data.products || []);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const saveRecentSearch = useCallback((q) => {
    try {
      const recent = JSON.parse(localStorage.getItem('luxe_recent_searches') || '[]');
      const updated = [q, ...recent.filter(r => r !== q)].slice(0, MAX_RECENT);
      localStorage.setItem('luxe_recent_searches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch { /* ignore */ }
  }, []);

  const handleSearch = (q) => {
    const term = (q || query).trim();
    if (!term) return;
    saveRecentSearch(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearRecent = () => {
    localStorage.removeItem('luxe_recent_searches');
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-16 md:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Search Panel */}
      <div className="relative w-full max-w-2xl animate-fade-in-down">
        {/* Input */}
        <div className="bg-white rounded-2xl shadow-luxe-xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <HiSearch className="w-5 h-5 text-secondary flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for dresses, bags, shoes..."
              className="flex-1 font-body text-primary text-base focus:outline-none placeholder:text-gray-400 bg-transparent"
            />
            {loading && (
              <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin flex-shrink-0" />
            )}
            {query && (
              <button
                onClick={() => setQuery('')}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <HiX className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200
                         transition-colors flex-shrink-0 ml-1"
            >
              <HiX className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Results/Suggestions */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Live Suggestions */}
            {query.length >= 2 && (
              <div className="p-3">
                {suggestions.length > 0 ? (
                  <>
                    <p className="font-body text-xs text-gray-400 uppercase tracking-wider px-2 mb-2">
                      Products
                    </p>
                    {suggestions.map(product => {
                      const img = product.images?.find(i => i.isMain) || product.images?.[0];
                      const price = product.salePrice || product.regularPrice;
                      return (
                        <button
                          key={product._id}
                          onClick={() => {
                            navigate(`/product/${product.slug}`);
                            onClose();
                          }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50
                                     transition-colors text-left group"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={img?.url || '/placeholder.jpg'}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm font-semibold text-primary line-clamp-1 group-hover:text-secondary transition-colors">
                              {product.title}
                            </p>
                            <p className="font-body text-xs text-secondary font-bold mt-0.5">
                              ${price?.toFixed(2)}
                            </p>
                          </div>
                          <HiSearch className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handleSearch()}
                      className="w-full mt-2 py-3 text-center font-body text-sm font-semibold text-secondary
                                 hover:bg-secondary/5 rounded-xl transition-colors border border-dashed border-secondary/30"
                    >
                      See all results for "{query}" →
                    </button>
                  </>
                ) : !loading && (
                  <div className="py-8 text-center">
                    <p className="font-body text-gray-400 text-sm">No products found for "{query}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between px-2 mb-2">
                  <p className="font-body text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <HiClock className="w-3 h-3" />
                    Recent Searches
                  </p>
                  <button
                    onClick={clearRecent}
                    className="font-body text-xs text-gray-400 hover:text-sale transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <HiClock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <span className="font-body text-sm text-gray-600 flex-1">{term}</span>
                    <HiSearch className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                ))}
              </div>
            )}

            {/* Trending */}
            {!query && (
              <div className="p-3 border-t border-gray-50">
                <p className="font-body text-xs text-gray-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1">
                  <HiTrendingUp className="w-3 h-3" />
                  Trending Now
                </p>
                <div className="flex flex-wrap gap-2 px-2 pb-2">
                  {TRENDING.map(term => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-4 py-2 bg-accent/30 hover:bg-secondary/10 text-primary hover:text-secondary
                                 rounded-full font-body text-xs font-semibold transition-colors border border-accent
                                 hover:border-secondary/30"
                    >
                      🔥 {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="text-center font-body text-xs text-white/40 mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">Enter</kbd> to search •{' '}
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
};

export default SearchOverlay;