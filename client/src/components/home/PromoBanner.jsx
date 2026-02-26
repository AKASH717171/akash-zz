import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineStar } from 'react-icons/hi';

const FEATURES = [
  { icon: HiOutlineTruck,       num: '01', title: 'Free US Shipping',    desc: 'Free standard shipping on all orders over $50 across the United States.' },
  { icon: HiOutlineShieldCheck, num: '02', title: 'Secure Checkout',     desc: 'Shop safely with SSL-encrypted payments via Visa, Mastercard & more.' },
  { icon: HiOutlineRefresh,     num: '03', title: '30-Day Easy Returns', desc: 'Not satisfied? Return within 30 days for a full refund — no questions asked.' },
  { icon: HiOutlineStar,        num: '04', title: 'Premium Quality',     desc: 'Every item is carefully curated and quality-checked before it ships to you.' },
];

const PromoBanner = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-luxe" />
    <div className="absolute inset-0 bg-pattern opacity-30" />
    <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/5 rounded-full" />
    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full" />

    <div className="relative z-10 container-luxe py-16 md:py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-sale/90 text-white px-5 py-2 rounded-full text-sm font-body font-semibold mb-6">
          ✨ WHY SHOP WITH LUXE FASHION
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          The Luxe <span className="text-gradient-gold">Difference</span>
        </h2>
        <p className="text-gray-400 font-body text-sm sm:text-base max-w-xl mx-auto">
          We're committed to delivering premium fashion with an exceptional shopping experience, every single time.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 max-w-4xl mx-auto">
        {FEATURES.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="relative group">
              {i < FEATURES.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] right-[-40%] h-px bg-gradient-to-r from-secondary/40 to-transparent z-0" />
              )}
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-6 text-center hover:bg-white/10 hover:border-secondary/30 transition-all duration-400">
                <span className="absolute -top-3 -right-2 text-5xl font-heading font-bold text-white/5 group-hover:text-secondary/10 transition-colors select-none">{step.num}</span>
                <div className="w-14 h-14 mx-auto rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-7 h-7 text-secondary" />
                </div>
                <h4 className="font-heading text-base font-bold text-white mb-1.5">{step.title}</h4>
                <p className="text-xs text-gray-400 font-body leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-3 bg-secondary text-white font-body font-bold py-4 px-10 sm:py-5 sm:px-14 rounded-xl text-base sm:text-lg shadow-gold-lg hover:shadow-gold transition-all duration-300 active:scale-[0.97]"
        >
          Shop New Arrivals
        </Link>
        <p className="text-gray-500 text-xs font-body mt-4">Free shipping on orders $50+. Easy 30-day returns.</p>
      </div>
    </div>
  </section>
);

export default PromoBanner;