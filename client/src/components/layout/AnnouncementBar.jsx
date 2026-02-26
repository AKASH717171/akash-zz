import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';

const AnnouncementBar = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const text = '🚚 FREE SHIPPING on orders over $50  ✦  🔒 Secure Checkout — Visa & Mastercard Accepted  ✦  🔄 Easy 30-Day Returns  ✦  🚚 FREE SHIPPING on orders over $50  ✦  ✨ New Arrivals Every Week  ✦  🔄 Easy 30-Day Returns';

  return (
    <div className="bg-primary text-white relative overflow-hidden z-50">
      <div className="flex items-center h-9">
        {/* Scrolling marquee */}
        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex">
            <span className="text-xs tracking-[0.2em] font-body font-light mx-4">
              {text}
            </span>
            <span className="text-xs tracking-[0.2em] font-body font-light mx-4">
              {text}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center
                     text-gray-400 hover:text-white transition-colors z-10 bg-primary"
          aria-label="Close announcement"
        >
          <HiX className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;