import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiAdjustments, HiX, HiFilter } from 'react-icons/hi';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import Pagination from '../components/common/Pagination';
import Breadcrumb from '../components/common/Breadcrumb';

const SORT_OPTIONS = [
  { value: 'popular', label: '🔥 Most Popular' },
  { value: 'newest', label: '🆕 Newest First' },
  { value: 'price_asc', label: '💰 Price: Low to High' },
  { value: 'price_desc', label: '💰 Price: High to Low' },
  { value: 'rating', label: '⭐ Top Rated' },
  { value: 'discount', label: '🏷️ Best Discount' },
];

const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-luxe">
    <div className="aspect-[3/4] skeleton" />
    <div className="p-4 space-y-2.5">
      <div className="skeleton h-3 w-1/3 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-5 w-1/2 rounded" />
    </div>
  </div>
);

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read filters from URL
  const getFiltersFromURL = useCallback(() => ({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sizes: searchParams.get('sizes') || '',
    colors: searchParams.get('colors') || '',
    sort: searchParams.get('sort') || 'popular',
    page: parseInt(searchParams.get('page') || '1'),
    search: searchParams.get('search') || '',
  }), [searchParams]);

  const filters = getFiltersFromURL();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        if (data.success) setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.set('category', filters.category);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.sizes) params.set('size', filters.sizes);
        if (filters.colors) params.set('color', filters.colors);
        if (filters.sort) params.set('sort', filters.sort);
        if (filters.search) params.set('search', filters.search);
        params.set('page', filters.page);
        params.set('limit', 100);

        const { data } = await api.get(`/products?${params.toString()}`);
        if (data.success) {
          setProducts(data.products || []);
          setPagination({
            currentPage: data.pagination?.currentPage || data.currentPage || 1,
            totalPages: data.pagination?.totalPages || data.totalPages || 1,
            total: data.pagination?.totalItems || data.total || data.count || 0,
          });
        }
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateURL = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleFiltersChange = (newFilters) => {
    updateURL(newFilters);
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    setSearchParams({ sort: filters.sort });
  };

  const handleSort = (val) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', val);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFiltersCount = [filters.category, filters.minPrice, filters.maxPrice, filters.sizes, filters.colors].filter(Boolean).length;

  const start = (filters.page - 1) * 12 + 1;
  const end = Math.min(filters.page * 12, pagination.total);

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: 'Shop' }]} />

      <div className="container-luxe py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
            🛍️ Shop All
          </h1>
          {filters.search && (
            <p className="font-body text-gray-500 text-sm">
              Showing results for: <span className="text-secondary font-semibold">"{filters.search}"</span>
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                categories={categories}
                filters={filters}
                onChange={handleFiltersChange}
                onClear={handleClearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200
                           font-body text-sm font-medium text-primary shadow-luxe hover:border-secondary transition-colors"
              >
                <HiFilter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Product Count */}
              <p className="font-body text-sm text-gray-500">
                {loading ? (
                  <span className="skeleton w-32 h-4 inline-block rounded" />
                ) : pagination.total > 0 ? (
                  <>Showing <span className="font-semibold text-primary">{start}–{end}</span> of <span className="font-semibold text-primary">{pagination.total}</span> products</>
                ) : (
                  'No products found'
                )}
              </p>

              {/* Sort */}
              <select
                value={filters.sort}
                onChange={e => handleSort(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-body text-gray-700
                           focus:outline-none focus:border-secondary bg-white shadow-luxe cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Active Filters Pills */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.category && (
                  <FilterPill label={`Category: ${filters.category}`} onRemove={() => updateURL({ category: '' })} />
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <FilterPill
                    label={`$${filters.minPrice || 0} – $${filters.maxPrice || 500}`}
                    onRemove={() => updateURL({ minPrice: '', maxPrice: '' })}
                  />
                )}
                {filters.sizes && filters.sizes.split(',').map(s => (
                  <FilterPill key={s} label={`Size: ${s}`} onRemove={() => {
                    const remaining = filters.sizes.split(',').filter(x => x !== s).join(',');
                    updateURL({ sizes: remaining });
                  }} />
                ))}
                {filters.colors && filters.colors.split(',').map(c => (
                  <FilterPill key={c} label={`Color: ${c}`} onRemove={() => {
                    const remaining = filters.colors.split(',').filter(x => x !== c).join(',');
                    updateURL({ colors: remaining });
                  }} />
                ))}
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-sale hover:text-red-700 font-body font-medium underline"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="font-heading text-2xl font-bold text-primary mb-2">No Products Found</h3>
                <p className="font-body text-gray-500 mb-6 max-w-sm">
                  Try adjusting your filters or search term to find what you're looking for.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-body font-semibold
                             hover:bg-secondary transition-colors duration-300"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                <div className="mt-10">
                  {pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePage}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 overflow-y-auto lg:hidden animate-slide-in-left">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-primary">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <HiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <ProductFilters
                categories={categories}
                filters={filters}
                onChange={handleFiltersChange}
                onClear={handleClearFilters}
                isMobile={true}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FilterPill = ({ label, onRemove }) => (
  <span className="flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary
                   text-xs font-body font-medium px-3 py-1.5 rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-sale transition-colors">
      <HiX className="w-3 h-3" />
    </button>
  </span>
);

export default Shop;