import React from 'react';
import { FaInstagram } from 'react-icons/fa';

const IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop&q=80',
];

const InstagramFeed = () => {
  return (
    <section className="py-16 bg-white overflow-hidden">
      {/* Header */}
      <div className="text-center mb-10 container-luxe">
        <p className="text-secondary text-xs tracking-[0.3em] uppercase font-body font-medium mb-3">
          📸 Follow Us
        </p>
        <h2 className="section-title">@LuxeFashion</h2>
        <div className="gold-divider" />
        <p className="section-subtitle mt-3">
          Join our community and get style inspiration daily
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1 sm:gap-2">
        {IMAGES.map((src, i) => (
          <a
            key={i}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden bg-gray-100"
          >
            <img
              src={src}
              alt={`Instagram ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                           flex items-center justify-center">
              <FaInstagram className="w-8 h-8 text-white transform scale-50 group-hover:scale-100 transition-transform duration-300" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default InstagramFeed;