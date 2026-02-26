import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { HiSearch } from 'react-icons/hi';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import Breadcrumb from '../components/common/Breadcrumb';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(query)}&limit=50`);
        if (data.success) setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: 'Search Results' }]} />
      <div className="container-luxe py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary mb-2 flex items-center gap-3">
            <HiSearch className="w-7 h-7 text-secondary" />
            Search Results
          </h1>
          {query && (
            <p className="font-body text-gray-500">
              {loading ? 'Searching...' : `${products.length} result${products.length !== 1 ? 's' : ''} for `}
              {!loading && <span className="font-semibold text-primary">"{query}"</span>}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-luxe">
                <div className="aspect-[3/4] skeleton" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-3 w-1/3 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-5 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-heading text-2xl font-bold text-primary mb-2">No Results Found</h3>
            <p className="font-body text-gray-500 mb-6 max-w-sm">
              {query ? `We couldn't find any products matching "${query}".` : 'Enter a search term to find products.'}
            </p>
            <Link to="/shop" className="px-6 py-3 bg-primary text-white rounded-xl font-body font-semibold hover:bg-secondary transition-colors">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;