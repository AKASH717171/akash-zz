import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { HiSearch } from 'react-icons/hi';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import Pagination from '../components/common/Pagination';

const SUGGESTIONS = ['Dress', 'Kurti', 'Bag', 'Shoes', 'Saree', 'Tops', 'Lehenga', 'Jacket'];

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

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) { setProducts([]); return; }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(query)}&page=${page}&limit=12`);
        if (data.success) {
          setProducts(data.products || []);
          setPagination({ total: data.total || 0, totalPages: data.totalPages || 1 });
        }
      } catch { setProducts([]); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, [query, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    }
  };

  const handlePage = (p) => {
    setSearchParams({ q: query, page: p.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-primary py-12 md:py-16 text-white">
        <div className="container-luxe max-w-2xl">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-center mb-6">
            Search Products
          </h1>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <HiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={localQuery}
                onChange={e => setLocalQuery(e.target.value)}
                placeholder="Search for dresses, bags, shoes..."
                className="w-full bg-white text-primary rounded-2xl pl-14 pr-36 py-4 font-body text-sm md:text-base
                           focus:outline-none focus:ring-2 focus:ring-secondary shadow-luxe-xl"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-secondary text-white
                           rounded-xl font-body font-bold text-sm hover:bg-secondary-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container-luxe py-10">
        {/* No query state */}
        {!query.trim() && (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-2">What are you looking for?</h2>
            <p className="font-body text-gray-500 mb-8">Try searching for popular items</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setSearchParams({ q: s })}
                  className="px-5 py-2.5 bg-white border border-gray-200 rounded-full font-body text-sm
                             font-semibold text-gray-600 hover:border-secondary hover:text-secondary
                             transition-colors shadow-luxe"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query.trim() && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div>
                {loading ? (
                  <div className="skeleton h-5 w-48 rounded" />
                ) : (
                  <p className="font-body text-gray-600">
                    {pagination.total > 0
                      ? <><span className="font-bold text-primary">{pagination.total}</span> results for "<span className="text-secondary">{query}</span>"</>
                      : <>No results for "<span className="text-secondary">{query}</span>"</>}
                  </p>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">😕</div>
                <h3 className="font-heading text-2xl font-bold text-primary mb-2">No Products Found</h3>
                <p className="font-body text-gray-500 mb-3 max-w-sm">
                  We couldn't find anything matching "<span className="text-secondary font-semibold">{query}</span>".
                </p>
                <p className="font-body text-gray-400 text-sm mb-8">Try different keywords or browse our categories.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/shop"
                    className="px-6 py-3 bg-primary text-white rounded-xl font-body font-semibold
                               hover:bg-secondary transition-colors"
                  >
                    Browse All Products
                  </Link>
                  <button
                    onClick={() => setSearchParams({})}
                    className="px-6 py-3 border border-gray-200 rounded-xl font-body font-semibold
                               text-gray-600 hover:border-secondary hover:text-secondary transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
                <div className="mt-10">
                  <p className="font-body text-sm text-gray-400 mb-4">You might be looking for:</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => setSearchParams({ q: s })}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-full font-body text-xs
                                   font-semibold text-gray-600 hover:border-secondary hover:text-secondary
                                   transition-colors shadow-luxe"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                <div className="mt-10">
                  <Pagination
                    currentPage={page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePage}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;