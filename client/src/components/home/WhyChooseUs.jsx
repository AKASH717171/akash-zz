import React from 'react';
import { HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineChatAlt2 } from 'react-icons/hi';

const FEATURES = [
  {
    icon: HiOutlineTruck,
    title: 'Free Shipping',
    description: 'Free delivery on all orders above $50. Fast & secure nationwide shipping.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Premium Quality',
    description: 'Every product is carefully curated and quality-checked before delivery.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: HiOutlineRefresh,
    title: 'Easy Returns',
    description: '30-day hassle-free return policy. Your satisfaction is our top priority.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: HiOutlineChatAlt2,
    title: '24/7 Support',
    description: 'Live chat support available around the clock. We\'re always here for you.',
    color: 'bg-purple-50 text-purple-600',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="section-padding bg-light">
      <div className="container-luxe">
        <div className="text-center mb-12">
          <p className="text-secondary text-xs tracking-[0.3em] uppercase font-body font-medium mb-3">
            Why Us
          </p>
          <h2 className="section-title">The LUXE Promise</h2>
          <div className="gold-divider" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-5 sm:p-7 text-center shadow-luxe hover:shadow-luxe-lg
                          transition-all duration-500 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl ${feature.color} flex items-center justify-center mb-5
                                group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-body leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;