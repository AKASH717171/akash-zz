import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import api from '../../utils/api';
import ProductCard from '../products/ProductCard';
import Spinner from '../common/Spinner';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/products/collection/new-arrivals?limit=30');
        if (data.success) setProducts(data.products);
      } catch (err) {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="section-padding"><Spinner text="Loading new arrivals..." /></div>;
  if (products.length === 0) return null;

  return (
    <section className="section-padding bg-white">
      <div className="container-luxe">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div className="text-center sm:text-left">
            <p className="text-secondary text-xs tracking-[0.3em] uppercase font-body font-medium mb-2">
              🆕 Just Dropped
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="btn-outline-gold btn-sm rounded-full flex items-center gap-2 group"
          >
            View All
            <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => (
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

export default NewArrivals;
