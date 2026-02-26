import React, { useState, useEffect, useCallback } from 'react';
import { HiStar, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { FaQuoteLeft } from 'react-icons/fa';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Emily Carter',
    location: 'New York, NY',
    rating: 5,
    text: 'Absolutely love LUXE FASHION! The silk dress I ordered arrived perfectly packaged and the quality is outstanding. It fits beautifully and I\'ve received so many compliments. Will definitely be ordering again!',
    avatar: 'E',
    product: 'Elegant Silk Maxi Dress',
  },
  {
    id: 2,
    name: 'Jessica Williams',
    location: 'Los Angeles, CA',
    rating: 5,
    text: 'The leather handbag I purchased exceeded all my expectations. The craftsmanship is incredible — genuine leather, beautiful stitching, and it arrived faster than expected. This is my new go-to fashion store!',
    avatar: 'J',
    product: 'Quilted Leather Shoulder Bag',
  },
  {
    id: 3,
    name: 'Sophia Martinez',
    location: 'Miami, FL',
    rating: 5,
    text: 'Best online shopping experience I\'ve had in years! The shoes are incredibly comfortable and stylish. Customer service was helpful when I had questions about sizing. Shipping was fast too. Highly recommend!',
    avatar: 'S',
    product: 'Italian Leather Ballet Flats',
  },
  {
    id: 4,
    name: 'Ashley Thompson',
    location: 'Chicago, IL',
    rating: 5,
    text: 'I ordered the floral dress and it\'s even more beautiful in person than in the photos. The fabric is luxurious and the fit is perfect. Free shipping was a great bonus. LUXE FASHION is now my favorite store!',
    avatar: 'A',
    product: 'Floral Wrap Midi Dress',
  },
];

const TestimonialCard = ({ testimonial }) => {
  const { name, location, rating, text, avatar, product } = testimonial;
  return (
    <div className="bg-light rounded-2xl p-6 sm:p-7 relative group hover:shadow-luxe transition-all duration-400">
      <FaQuoteLeft className="text-secondary/15 w-10 h-10 absolute top-5 right-6" />
      <div className="flex items-center gap-0.5 mb-4">
        {[1,2,3,4,5].map(star => (
          <HiStar key={star} className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
      <p className="text-sm text-gray-600 font-body leading-relaxed mb-5 line-clamp-4 min-h-[5em]">"{text}"</p>
      {product && (
        <p className="text-[10px] text-secondary font-body font-medium uppercase tracking-wider mb-4">
          Purchased: {product}
        </p>
      )}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <span className="text-secondary font-bold text-sm">{avatar}</span>
        </div>
        <div>
          <p className="font-heading font-semibold text-primary text-sm">{name}</p>
          <p className="text-[11px] text-gray-400 font-body">{location}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent(prev => (prev + 1) % TESTIMONIALS.length), []);
  const prev = useCallback(() => setCurrent(prev => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="section-padding bg-white overflow-hidden">
      <div className="container-luxe">
        <div className="text-center mb-12">
          <p className="text-secondary text-xs tracking-[0.3em] uppercase font-body font-medium mb-3">Customer Reviews</p>
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="gold-divider" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="md:hidden">
            <div className="px-4"><TestimonialCard testimonial={TESTIMONIALS[current]} /></div>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={prev} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-secondary hover:text-secondary transition-colors">
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-secondary w-6' : 'bg-gray-300'}`} />
                ))}
              </div>
              <button onClick={next} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-secondary hover:text-secondary transition-colors">
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.slice(0, 3).map(t => <TestimonialCard key={t.id} testimonial={t} />)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;