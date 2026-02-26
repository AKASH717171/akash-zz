import React, { useState, useEffect } from 'react';
import useChat from '../../hooks/useChat';

const ChatCouponBanner = () => {
  const { toggleChat } = useChat();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`w-full bg-gradient-to-r from-[#1A1A2E] via-[#16213E] to-[#1A1A2E] transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="container-luxe py-0">
        <div
          onClick={toggleChat}
          className="relative overflow-hidden rounded-none cursor-pointer group"
        >
          {/* Animated gold shimmer background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C4A35A]/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms] ease-in-out" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5">
            {/* Left: Icon + Text */}
            <div className="flex items-center gap-4">
              {/* Pulsing chat icon */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 bg-[#C4A35A] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">💬</span>
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1A1A2E] animate-pulse" />
              </div>

              {/* Text */}
              <div>
                <p className="font-heading text-white text-lg font-bold leading-tight">
                  Chat With Us &{' '}
                  <span className="text-[#C4A35A]">Get Exclusive Coupon!</span>
                </p>
                <p className="font-body text-gray-300 text-sm mt-0.5">
                  Chat with us → Share your name & email → Receive your exclusive discount coupon 🎁
                </p>
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-[#C4A35A] hover:bg-[#b8923f] text-white font-body font-bold text-sm px-6 py-3 rounded-full shadow-lg group-hover:shadow-[0_0_20px_rgba(196,163,90,0.5)] transition-all duration-300">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                Chat Now
                <span className="text-base">→</span>
              </div>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C4A35A] to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default ChatCouponBanner;