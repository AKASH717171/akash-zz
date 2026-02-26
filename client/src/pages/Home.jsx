import React from 'react';
import HeroSection from '../components/home/HeroSection';
import CategoryShowcase from '../components/home/CategoryShowcase';
import FeaturedProducts from '../components/home/FeaturedProducts';
import NewArrivals from '../components/home/NewArrivals';
import Testimonials from '../components/home/Testimonials';

const Home = () => {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <NewArrivals />
      <Testimonials />

      {/* Instagram Follow Us heading only */}
      <section className="py-10 bg-white">
        <div className="text-center container-luxe">
          <p className="text-secondary text-xs tracking-[0.3em] uppercase font-body font-medium mb-3">
            📸 Follow Us
          </p>
          <h2 className="section-title">@LuxeFashion</h2>
          <div className="gold-divider" />
          <p className="section-subtitle mt-3">
            Join our community and get style inspiration daily
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;