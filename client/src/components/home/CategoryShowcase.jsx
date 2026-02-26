import React from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';

const CATEGORIES = [
  {
    name: 'Women Fashion',
    slug: 'women-fashion',
    tagline: 'Elegance in Every Stitch',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    color: 'from-pink-900/70',
  },
  {
    name: 'Bags',
    slug: 'bags',
    tagline: 'Carry Your Story',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    color: 'from-amber-900/70',
  },
  {
    name: 'Shoes',
    slug: 'shoes',
    tagline: 'Step Into Luxury',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    color: 'from-indigo-900/70',
  },
];

const CategoryShowcase = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-luxe">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-secondary text-xs tracking-[0.3em] uppercase font-body font-medium mb-3">
            Explore Collections
          </p>
          <h2 className="section-title">Shop by Category</h2>
          <div className="gold-divider" />
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7">
          {CATEGORIES.map((cat, index) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className="group relative h-[420px] sm:h-[480px] rounded-2xl overflow-hidden shadow-luxe hover:shadow-luxe-xl transition-all duration-500"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              {/* Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} via-black/30 to-transparent
                              opacity-80 group-hover:opacity-90 transition-opacity duration-500`} />

              {/* Decorative line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-secondary text-xs tracking-[0.2em] uppercase font-body mb-2
                             transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  {cat.tagline}
                </p>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-4">
                  {cat.name}
                </h3>
                <div className="flex items-center gap-2 text-white font-body text-sm font-medium
                               transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <span>Shop Collection</span>
                  <HiArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-secondary/50
                             opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;