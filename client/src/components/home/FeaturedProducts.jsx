import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import api from '../../utils/api';
import ProductCard from '../products/ProductCard';
import Spinner from '../common/Spinner';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products/collection/featured?limit=30');
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error('Fetch featured error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) return <div className="section-padding"><Spinner text="Loading products..." /></div>;
  if (products.length === 0) return null;

  return (
    <section className="section-padding bg-light bg-pattern">
      <div className="container-luxe">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div className="text-center sm:text-left">
            <p className="text-secondary text-xs tracking-[0.3em] uppercase font-body font-medium mb-2">
              ✨ Trending Now
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary">
              Our Best Sellers
            </h2>
          </div>
          <Link
            to="/shop?sort=popular"
            className="btn-outline-gold btn-sm rounded-full flex items-center gap-2 group"
          >
            View All
            <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 30).map((product, index) => (
            <div
              key={product._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;