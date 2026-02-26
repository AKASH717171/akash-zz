import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ProductCard from './ProductCard';

const RelatedProducts = ({ productId, categorySlug }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    const fetch = async () => {
      try {
        const { data } = await api.get(`/products/${productId}/related`);
        if (data.success) setProducts(data.products || []);
      } catch {
        // Fallback: fetch by category
        try {
          if (categorySlug) {
            const { data } = await api.get(`/products?category=${categorySlug}&limit=4`);
            if (data.success) {
              setProducts((data.products || []).filter(p => p._id !== productId).slice(0, 4));
            }
          }
        } catch { /* ignore */ }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [productId, categorySlug]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary">
          You May Also Like
        </h2>
        <div className="w-16 h-0.5 bg-secondary mx-auto mt-3" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
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
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default RelatedProducts;