import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineHeart, HiHeart, HiOutlineShoppingBag, HiOutlineEye, HiStar } from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [wishLoading, setWishLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  // Mobile touch hover state — tap করলে on হবে, বাইরে tap করলে off হবে
  const [touched, setTouched] = useState(false);
  const cardRef = useRef(null);

  // বাইরে tap করলে touched off
  useEffect(() => {
    if (!touched) return;
    const handleOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setTouched(false);
      }
    };
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => document.removeEventListener('touchstart', handleOutside);
  }, [touched]);

  const {
    _id, title, slug, images = [], regularPrice, salePrice,
    discountPercent, ratings, category, newArrival, featured, stock, tags = [],
  } = product;

  const mainImage = images.find((img) => img.isMain) || images[0];
  const secondImage = images.find((img) => !img.isMain) || images[1];
  const isOnSale = salePrice && salePrice < regularPrice;
  const currentPrice = isOnSale ? salePrice : regularPrice;
  const isInWishlist = isAuthenticated && user?.wishlist?.some((id) =>
    (typeof id === 'string' ? id : id?._id?.toString?.() || id?.toString?.()) === _id
  );
  const isOutOfStock = stock <= 0;

  const formatPrice = (price) => `$${price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`;

  const handleWishlist = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      setWishLoading(true);
      const { data } = await api.post('/wishlist/toggle', { productId: _id });
      if (data.success) {
        toast.success(data.message);
        refreshUser?.();
      }
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setWishLoading(false);
    }
  }, [_id, isAuthenticated, navigate, refreshUser]);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (isOutOfStock) { toast.error('Out of stock'); return; }
    try {
      setCartLoading(true);
      const result = await addToCart(_id, 1);
      if (result.success) {
        toast.success(result.message || 'Added to cart!');
      } else {
        toast.error(result.message || 'Failed');
      }
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  }, [_id, isAuthenticated, isOutOfStock, addToCart, navigate]);

  // Mobile: card-এ touch করলে toggle
  const handleCardTouch = useCallback((e) => {
    // button বা link-এ touch হলে toggle করব না
    if (e.target.closest('button') || e.target.closest('a')) return;
    setTouched((prev) => !prev);
  }, []);

  // active = PC hover OR mobile touch
  const isActive = touched; // CSS group-hover PC-তে handle করবে

  return (
    <div
      ref={cardRef}
      className="group relative bg-white rounded-xl overflow-hidden shadow-luxe hover:shadow-luxe-lg transition-all duration-500"
      onTouchStart={handleCardTouch}
    >
      {/* Image Container */}
      <Link to={`/product/${slug}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100">
        {/* Skeleton */}
        {!imageLoaded && <div className="absolute inset-0 skeleton" />}

        {/* Main Image */}
        <img
          src={mainImage?.url || '/placeholder.jpg'}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${secondImage
              ? `group-hover:opacity-0 ${touched ? 'opacity-0' : ''}`
              : `group-hover:scale-105 ${touched ? 'scale-105' : ''}`
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Second Image — PC hover OR mobile touch */}
        {secondImage && (
          <img
            src={secondImage.url}
            alt={`${title} - 2`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
              touched ? 'opacity-100 scale-105' : 'opacity-0 group-hover:opacity-100'
            }`}
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOnSale && (
            <span className="bg-sale text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
              {discountPercent || Math.round(((regularPrice - salePrice) / regularPrice) * 100)}% OFF
            </span>
          )}
          {newArrival && (
            <span className="bg-primary text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
              NEW
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-800 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Button — PC hover OR mobile touch দেখাবে */}
        <button
          onClick={handleWishlist}
          disabled={wishLoading}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center
                     shadow-md transition-all duration-300 ${
                       isInWishlist
                         ? 'bg-sale text-white opacity-100'
                         : `bg-white/90 text-gray-600 hover:bg-sale hover:text-white
                            opacity-0 group-hover:opacity-100 ${touched ? '!opacity-100' : ''}`
                     } ${wishLoading ? 'animate-pulse' : ''}`}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isInWishlist ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
        </button>

        {/* Add to Cart + View — PC hover slide-up, Mobile touch slide-up — same animation! */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 flex gap-2 z-10
                         transform transition-transform duration-300
                         group-hover:translate-y-0
                         ${touched ? 'translate-y-0' : 'translate-y-full'}`}>
          <button
            onClick={handleAddToCart}
            disabled={cartLoading || isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-body font-semibold
                       transition-all duration-300 shadow-md ${
                         isOutOfStock
                           ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                           : 'bg-primary text-white hover:bg-secondary active:scale-[0.97]'
                       }`}
          >
            {cartLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <HiOutlineShoppingBag className="w-4 h-4" />
                <span className="hidden xs:inline">{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                <span className="xs:hidden">{isOutOfStock ? 'Sold Out' : 'Add'}</span>
              </>
            )}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickView(true); }}
            className="w-10 h-10 flex items-center justify-center bg-white text-primary hover:bg-secondary hover:text-white
                      rounded-lg transition-all duration-300 shadow-md"
            aria-label="Quick view"
          >
            <HiOutlineEye className="w-4 h-4" />
          </button>
        </div>

        {/* Dark gradient — PC hover OR mobile touch */}
        <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent
                         transition-opacity duration-300 z-[5]
                         group-hover:opacity-100
                         ${touched ? 'opacity-100' : 'opacity-0'}`} />
      </Link>

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}

      {/* Info */}
      <div className="p-3 sm:p-4">
        {/* Category */}
        {category && (
          <Link
            to={`/shop?category=${category.slug}`}
            className="text-[10px] sm:text-xs text-secondary font-body font-medium uppercase tracking-wider hover:text-secondary-600 transition-colors"
          >
            {category.name}
          </Link>
        )}

        {/* Title */}
        <Link to={`/product/${slug}`}>
          <h3 className="font-body text-sm sm:text-base font-semibold text-primary mt-1 line-clamp-2 hover:text-secondary transition-colors leading-snug min-h-[2.5em]">
            {title}
          </h3>
        </Link>

        {/* Rating */}
        {ratings && ratings.count > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <HiStar
                  key={star}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                    star <= Math.round(ratings.average) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-gray-400 font-body">({ratings.count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2.5">
          <span className="font-heading text-lg sm:text-xl font-bold text-primary">
            {formatPrice(currentPrice)}
          </span>
          {isOnSale && (
            <span className="text-xs sm:text-sm text-gray-400 line-through font-body">
              {formatPrice(regularPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);