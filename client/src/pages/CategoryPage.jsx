import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { HiFilter, HiX, HiChat } from 'react-icons/hi';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import Pagination from '../components/common/Pagination';
import Breadcrumb from '../components/common/Breadcrumb';
import { useChatContext } from '../context/ChatContext';

const SORT_OPTIONS = [
  { value: 'popular', label: '🔥 Most Popular' },
  { value: 'newest', label: '🆕 Newest First' },
  { value: 'price_asc', label: '💰 Price: Low to High' },
  { value: 'price_desc', label: '💰 Price: High to Low' },
  { value: 'rating', label: '⭐ Top Rated' },
];

const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-luxe">
    <div className="aspect-[3/4] skeleton" />
    <div className="p-4 space-y-2.5">
      <div className="skeleton h-3 w-1/3 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-5 w-1/2 rounded" />
    </div>
  </div>
);

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { toggleChat } = useChatContext?.() || {};

  const getFilters = useCallback(() => ({
    subCategory: searchParams.get('sub') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sizes: searchParams.get('sizes') || '',
    colors: searchParams.get('colors') || '',
    sort: searchParams.get('sort') || 'popular',
    page: parseInt(searchParams.get('page') || '1'),
  }), [searchParams]);

  const filters = getFilters();

  // Fetch category info
  useEffect(() => {
    const fetchCategory = async () => {
      setCatLoading(true);
      try {
        const { data } = await api.get(`/categories/${slug}`);
        if (data.success) {
          setCategory(data.category);
          setSubCategories(data.category.children || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCatLoading(false);
      }
    };
    if (slug) fetchCategory();
  }, [slug]);

  // Fetch all categories for filter sidebar
  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      if (data.success) setAllCategories(data.categories || []);
    }).catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('category', slug);
        if (filters.subCategory) params.set('subCategory', filters.subCategory);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.sizes) params.set('size', filters.sizes);
        if (filters.colors) params.set('color', filters.colors);
        params.set('sort', filters.sort);
        params.set('page', filters.page);
        params.set('limit', 12);

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
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProducts();
  }, [slug, searchParams]);

  const updateURL = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSubCategory = (sub) => {
    updateURL({ sub: filters.subCategory === sub ? '' : sub });
  };

  const handleFiltersChange = (newFilters) => {
    updateURL({
      minPrice: newFilters.minPrice,
      maxPrice: newFilters.maxPrice,
      sizes: newFilters.sizes,
      colors: newFilters.colors,
    });
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    setSearchParams({ sort: filters.sort });
  };

  const handlePage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const start = (filters.page - 1) * 12 + 1;
  const end = Math.min(filters.page * 12, pagination.total);

  if (catLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-64 skeleton w-full" />
        <div className="container-luxe py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb
        items={[
          { label: 'Shop', path: '/shop' },
          { label: category?.name || slug },
        ]}
      />

      {/* Category Hero Banner */}
      <div className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-transparent" />
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-secondary rounded-full"
              style={{ left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 10) % 100}%`, opacity: 0.3 + (i % 5) * 0.1 }}
            />
          ))}
        </div>
        <div className="container-luxe relative py-14 md:py-20 text-center text-white">
          <p className="font-body text-secondary text-sm uppercase tracking-widest mb-3 animate-fade-in-down">
            Collection
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
            {category?.name || slug}
          </h1>
          {category?.description && (
            <p className="font-body text-white/70 max-w-lg mx-auto text-sm md:text-base animate-fade-in-up">
              {category.description}
            </p>
          )}
          <div className="mt-4 font-body text-white/50 text-sm animate-fade-in-up">
            {pagination.total > 0 && `${pagination.total} Products`}
          </div>
        </div>
      </div>

      {/* 80% Off Chat Banner */}
      <div className="bg-gradient-to-r from-secondary/20 via-accent to-secondary/20 border-y border-secondary/30">
        <div className="container-luxe py-3 flex items-center justify-center gap-3 flex-wrap text-center">
          <span className="font-body text-sm font-semibold text-primary">
            🎁 Get <span className="text-sale font-bold">80% OFF</span> on {category?.name || 'this collection'}!
          </span>
          <button
            onClick={toggleChat}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-body font-bold
                       px-4 py-1.5 rounded-full hover:bg-secondary transition-colors duration-300 shadow-gold"
          >
            <HiChat className="w-3.5 h-3.5" />
            Chat Now for Coupon
          </button>
        </div>
      </div>

      <div className="container-luxe py-8">
        {/* Sub-category Tabs */}
        {subCategories.length > 0 && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => handleSubCategory('')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-body font-semibold transition-all duration-200 ${
                !filters.subCategory
                  ? 'bg-primary text-white shadow-luxe'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-secondary hover:text-secondary'
              }`}
            >
              All
            </button>
            {subCategories.map(sub => (
              <button
                key={sub._id}
                onClick={() => handleSubCategory(sub.slug)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-body font-semibold transition-all duration-200 ${
                  filters.subCategory === sub.slug
                    ? 'bg-primary text-white shadow-luxe'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-secondary hover:text-secondary'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                categories={allCategories}
                filters={{ ...filters, category: slug }}
                onChange={(f) => handleFiltersChange({ ...f, category: undefined })}
                onClear={handleClearFilters}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200
                           font-body text-sm font-medium text-primary shadow-luxe"
              >
                <HiFilter className="w-4 h-4" />
                Filters
              </button>

              <p className="font-body text-sm text-gray-500">
                {loading ? '...' : pagination.total > 0
                  ? <>Showing <span className="font-semibold text-primary">{start}–{end}</span> of <span className="font-semibold text-primary">{pagination.total}</span></>
                  : 'No products found'}
              </p>

              <select
                value={filters.sort}
                onChange={e => updateURL({ sort: e.target.value })}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-body bg-white shadow-luxe
                           focus:outline-none focus:border-secondary cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">👗</div>
                <h3 className="font-heading text-2xl font-bold text-primary mb-2">No Products Found</h3>
                <p className="font-body text-gray-500 mb-6">Try adjusting your filters.</p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-body font-semibold hover:bg-secondary transition-colors"
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
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 overflow-y-auto lg:hidden animate-slide-in-left">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-primary">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <HiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <ProductFilters
                categories={allCategories}
                filters={{ ...filters, category: slug }}
                onChange={(f) => handleFiltersChange({ ...f, category: undefined })}
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

export default CategoryPage;