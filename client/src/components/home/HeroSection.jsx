import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChatAlt2, HiOutlineShoppingBag, HiOutlineClock, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import useChat from '../../hooks/useChat';

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80',
    tagline: 'GRAND OPENING SALE',
    heading: 'UP TO 80% OFF',
    subheading: 'on Your First Order',
    description: 'Discover premium women\'s fashion at unbeatable prices. Shop now and save big!',
    ctaPrimary: { text: '🛒 Shop Sale', link: '/shop?sale=true' },
    ctaSecondary: { text: '🛒 Shop Now', link: '/shop' },
    badge: '⏰ Limited Time Offer',
    align: 'left',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
    tagline: 'NEW COLLECTION 2025',
    heading: 'Elegance',
    subheading: 'Redefined',
    description: 'Discover premium women\'s fashion, handcrafted bags, and designer shoes.',
    ctaPrimary: { text: 'Explore Collection', link: '/shop?sort=newest' },
    ctaSecondary: { text: 'View Lookbook', link: '/shop?featured=true' },
    badge: null,
    align: 'center',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80',
    tagline: 'LUXURY BAGS',
    heading: 'Carry Your',
    subheading: 'Confidence',
    description: 'Handpicked leather bags for the modern woman. Premium quality, timeless design.',
    ctaPrimary: { text: 'Shop Bags', link: '/shop?category=bags' },
    ctaSecondary: { text: 'View All', link: '/shop' },
    badge: null,
    align: 'right',
  },
];

// Countdown Timer
const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = React.useState(() => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  });
  React.useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); clearInterval(interval); return; }
      setTimeLeft({
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  return timeLeft;
};

const CountdownTimer = () => {
  const [target] = React.useState(() => {
    try {
      const stored = sessionStorage.getItem('luxe_offer_end');
      if (stored) return stored;
      const t = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      sessionStorage.setItem('luxe_offer_end', t);
      return t;
    } catch { return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); }
  });
  const { hours, minutes, seconds } = useCountdown(target);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 w-fit">
      <HiOutlineClock className="w-4 h-4 text-sale animate-pulse flex-shrink-0" />
      <span className="text-white text-xs font-body">⏰ Offer ends in:</span>
      {[{ v: pad(hours), l: 'HRS' }, { v: pad(minutes), l: 'MIN' }, { v: pad(seconds), l: 'SEC' }].map(({ v, l }, i) => (
        <React.Fragment key={l}>
          {i > 0 && <span className="text-secondary font-bold text-sm">:</span>}
          <div className="text-center">
            <div className="text-white font-heading font-bold text-base leading-none">{v}</div>
            <div className="text-gray-400 text-[8px] font-body">{l}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

const HeroSection = () => {
  const { openChat } = useChat();
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(index);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((current + 1) % SLIDES.length);
  }, [current, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((current - 1 + SLIDES.length) % SLIDES.length);
  }, [current, goToSlide]);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = SLIDES[current];

  // ✅ FIXED: Full class names hardcoded — Tailwind JIT এ সঠিকভাবে কাজ করবে
  const alignClasses = {
    left: 'sm:items-start sm:text-left',
    center: 'sm:items-center sm:text-center',
    right: 'sm:items-end sm:text-right',
  };

  return (
    <section className="relative h-[85vh] sm:h-[90vh] lg:h-screen max-h-[900px] overflow-hidden bg-primary">
      {/* Background Images */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out ${
            i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <img
            src={s.image}
            alt={s.tagline}
            className="w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-primary/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-primary/20" />

      {/* Content */}
      <div className="relative z-10 container-luxe h-full flex items-center">
        {/* ✅ FIXED: Dynamic class concatenation বাদ, সরাসরি alignClasses ব্যবহার */}
        <div className={`flex flex-col items-start text-left ${alignClasses[slide.align]} w-full max-w-2xl ${
          slide.align === 'right' ? 'sm:ml-auto' : slide.align === 'center' ? 'sm:mx-auto' : ''
        }`}>
          {/* Badge */}
          {slide.badge && (
            <div
              key={`badge-${current}`}
              className="animate-fade-in-down inline-flex items-center gap-2 bg-sale/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs sm:text-sm font-body font-semibold mb-6 shadow-lg w-fit"
            >
              <HiOutlineClock className="w-4 h-4 animate-pulse" />
              {slide.badge}
            </div>
          )}

          {/* Tagline */}
          <p
            key={`tag-${current}`}
            className="animate-fade-in-right text-secondary text-xs sm:text-sm tracking-[0.3em] uppercase font-body font-medium mb-4"
          >
            {slide.tagline}
          </p>

          {/* Heading */}
          <h1
            key={`head-${current}`}
            className="animate-fade-in-up font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-2"
          >
            {slide.heading}
          </h1>

          {/* Subheading */}
          <h2
            key={`sub-${current}`}
            className="animate-fade-in-up font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{ animationDelay: '150ms' }}
          >
            <span className="text-gradient-gold">{slide.subheading}</span>
          </h2>

          {/* Description */}
          <p
            key={`desc-${current}`}
            className="animate-fade-in-up text-gray-300 font-body text-sm sm:text-base lg:text-lg mb-8 max-w-lg leading-relaxed"
            style={{ animationDelay: '300ms' }}
          >
            {slide.description}
          </p>

          {/* CTAs */}
          <div
            key={`cta-${current}`}
            className="animate-fade-in-up flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
            style={{ animationDelay: '450ms' }}
          >
            {slide.ctaPrimary.action === 'chat' ? (
              <button
                onClick={openChat}
                className="group relative overflow-hidden bg-secondary text-white font-body font-semibold
                           py-3.5 px-8 sm:py-4 sm:px-10 rounded-lg text-sm sm:text-base
                           shadow-gold hover:shadow-gold-lg transition-all duration-300
                           flex items-center gap-2 active:scale-[0.97]"
              >
                <HiOutlineChatAlt2 className="w-5 h-5 group-hover:animate-bounce" />
                <span className="relative z-10">{slide.ctaPrimary.text}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-600 to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ) : (
              <Link
                to={slide.ctaPrimary.link}
                className="group bg-secondary text-white font-body font-semibold
                           py-3.5 px-8 sm:py-4 sm:px-10 rounded-lg text-sm sm:text-base
                           shadow-gold hover:shadow-gold-lg hover:bg-secondary-600 transition-all duration-300
                           flex items-center gap-2 active:scale-[0.97]"
              >
                {slide.ctaPrimary.text}
              </Link>
            )}

            <Link
              to={slide.ctaSecondary.link}
              className="group border-2 border-white/30 text-white font-body font-semibold
                         py-3.5 px-8 sm:py-4 sm:px-10 rounded-lg text-sm sm:text-base
                         hover:bg-white/10 hover:border-white/60 transition-all duration-300
                         flex items-center gap-2 backdrop-blur-sm active:scale-[0.97]"
            >
              <HiOutlineShoppingBag className="w-5 h-5" />
              {slide.ctaSecondary.text}
            </Link>

            {/* Live Chat Button */}
            <button
              onClick={openChat}
              className="group relative overflow-hidden border-2 border-[#C4A35A] text-[#C4A35A] font-body font-semibold
                         py-3.5 px-8 sm:py-4 sm:px-10 rounded-lg text-sm sm:text-base
                         hover:bg-[#C4A35A] hover:text-white transition-all duration-300
                         flex items-center gap-2 backdrop-blur-sm active:scale-[0.97]"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <HiOutlineChatAlt2 className="w-5 h-5" />
              💬 Live Chat — Get Coupon
            </button>
          </div>

          {/* Countdown Timer (only first slide) */}
          {current === 0 && (
            <div
              className="animate-fade-in-up mt-6"
              style={{ animationDelay: '550ms' }}
            >
              <CountdownTimer />
            </div>
          )}

          {/* Trust badges (only first slide) */}
          {current === 0 && (
            <div
              className="animate-fade-in-up flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-white/10"
              style={{ animationDelay: '600ms' }}
            >
              {[
                { icon: '🚚', text: 'Free Shipping' },
                { icon: '🔒', text: 'Secure Payment' },
                { icon: '🔄', text: 'Easy Returns' },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-xs text-gray-400 font-body">{b.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm
                   flex items-center justify-center text-white
                   hover:bg-white/20 transition-all duration-300 border border-white/20"
        aria-label="Previous slide"
      >
        <HiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm
                   flex items-center justify-center text-white
                   hover:bg-white/20 transition-all duration-300 border border-white/20"
        aria-label="Next slide"
      >
        <HiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? 'w-8 h-2.5 bg-secondary'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Decorative bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  );
};

export default HeroSection;