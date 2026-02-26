import React, { useState, useRef, useCallback } from 'react';
import { HiChevronLeft, HiChevronRight, HiZoomIn } from 'react-icons/hi';

const ImageGallery = ({ images = [], title = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);
  const imgRef = useRef(null);

  const mainImage = images[activeIndex];

  const handleMouseMove = useCallback((e) => {
    if (!imgRef.current || !zoomed) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.min(Math.max(x, 0), 100), y: Math.min(Math.max(y, 0), 100) });
  }, [zoomed]);

  const prev = () => setActiveIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex(i => (i + 1) % images.length);

  // Touch swipe
  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    else if (diff < -50) prev();
    touchStart.current = null;
  };

  if (!images.length) {
    return (
      <div className="aspect-[3/4] bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400 font-body text-sm">No Image</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div
        className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 shadow-luxe group cursor-zoom-in"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setLightbox(true)}
      >
        <img
          ref={imgRef}
          src={mainImage?.url || '/placeholder.jpg'}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-200 ${zoomed ? 'scale-150' : 'scale-100'}`}
          style={zoomed ? {
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
          } : {}}
          draggable={false}
        />

        {/* Nav Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm
                         rounded-full flex items-center justify-center shadow-luxe opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                         transition-opacity duration-200 hover:bg-white z-10"
            >
              <HiChevronLeft className="w-5 h-5 text-primary" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm
                         rounded-full flex items-center justify-center shadow-luxe opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                         transition-opacity duration-200 hover:bg-white z-10"
            >
              <HiChevronRight className="w-5 h-5 text-primary" />
            </button>
          </>
        )}

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 text-white text-xs
                       px-2.5 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                       font-body backdrop-blur-sm">
          <HiZoomIn className="w-3.5 h-3.5" />
          Zoom
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/40 text-white text-xs px-2.5 py-1.5
                         rounded-full font-body backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i === activeIndex
                  ? 'border-secondary shadow-gold scale-105'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={img.url}
                alt={`${title} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-bold z-10"
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full
                           flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              >
                <HiChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full
                           flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              >
                <HiChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
          <img
            src={mainImage?.url}
            alt={title}
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'bg-secondary scale-125' : 'bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;