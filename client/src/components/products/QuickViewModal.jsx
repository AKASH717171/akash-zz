import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { HiX, HiOutlineHeart, HiHeart, HiStar } from 'react-icons/hi';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, user, refreshUser } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const {
    _id, title, slug, images = [], regularPrice, salePrice,
    discountPercent, sizes = [], colors = [], stock, ratings, category,
  } = product;

  const isOnSale = salePrice && salePrice < regularPrice;
  const currentPrice = isOnSale ? salePrice : regularPrice;
  const savings = isOnSale ? regularPrice - salePrice : 0;
  const isInWishlist = isAuthenticated && user?.wishlist?.some(id => (id?._id || id)?.toString() === _id);

  useEffect(() => {
    if (colors?.length > 0) setSelectedColor(colors[0]);
    if (sizes?.length > 0) setSelectedSize(sizes[0]);
  }, [product]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (stock <= 0) { toast.error('Out of stock'); return; }
    setLoading(true);
    const result = await addToCart(
      _id, qty,
      selectedSize?.name || selectedSize,
      selectedColor?.name || selectedColor
    );
    if (result.success) {
      toast.success('Added to cart!');
      onClose();
    } else {
      toast.error(result.message || 'Failed to add');
    }
    setLoading(false);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    setWishLoading(true);
    try {
      const { data } = await api.post('/wishlist/toggle', { productId: _id });
      if (data.success) { toast.success(data.message); refreshUser?.(); }
    } catch { toast.error('Failed'); }
    finally { setWishLoading(false); }
  };

  const mainImg = images[selectedImage] || images[0];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-luxe-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <HiX className="w-5 h-5 text-gray-600" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Images */}
          <div className="bg-gray-50 rounded-tl-2xl rounded-bl-2xl overflow-hidden">
            <div className="aspect-[3/4] relative">
              <img src={mainImg?.url || '/placeholder.jpg'} alt={title} className="w-full h-full object-cover" />
              {isOnSale && (
                <div className="absolute top-3 left-3 bg-sale text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  {discountPercent || Math.round(((regularPrice - salePrice) / regularPrice) * 100)}% OFF
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-secondary' : 'border-transparent'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 space-y-4">
            {category && (
              <span className="font-body text-xs text-secondary font-semibold uppercase tracking-wider">{category.name}</span>
            )}
            <h2 className="font-heading text-xl font-bold text-primary leading-snug">{title}</h2>

            {ratings?.count > 0 && (
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(s => (
                  <HiStar key={s} className={`w-4 h-4 ${s <= Math.round(ratings.average) ? 'text-yellow-400' : 'text-gray-200'}`} />
                ))}
                <span className="font-body text-xs text-gray-400">({ratings.count})</span>
              </div>
            )}

            {/* Price - fixed double dollar sign */}
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-2xl font-bold text-primary">
                ${currentPrice?.toFixed(2)}
              </span>
              {isOnSale && (
                <>
                  <span className="font-body text-sm text-gray-400 line-through">${regularPrice?.toFixed(2)}</span>
                  <span className="font-body text-xs text-sale font-semibold">Save ${savings?.toFixed(2)}</span>
                </>
              )}
            </div>

            <p className={`font-body text-sm font-medium ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {stock > 0 ? '● In Stock' : '● Out of Stock'}
            </p>

            {/* Colors - fixed object rendering */}
            {colors?.length > 0 && (
              <div>
                <p className="font-body text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  Color: <span className="text-secondary capitalize">{selectedColor?.name || selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button key={color?.name || color} onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-body font-medium capitalize transition-all ${
                        (selectedColor?.name || selectedColor) === (color?.name || color)
                          ? 'bg-primary text-white border-primary'
                          : 'border-gray-200 text-gray-600 hover:border-secondary'
                      }`}>
                      {color?.name || color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes - fixed object rendering */}
            {sizes?.length > 0 && (
              <div>
                <p className="font-body text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  Size: <span className="text-secondary">{selectedSize?.name || selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button key={size?.name || size} onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-body font-semibold transition-all ${
                        (selectedSize?.name || selectedSize) === (size?.name || size)
                          ? 'bg-primary text-white border-primary'
                          : 'border-gray-200 text-gray-600 hover:border-secondary'
                      }`}>
                      {size?.name || size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="font-body text-xs font-semibold text-primary uppercase tracking-wider mb-2">Quantity</p>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-32">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-primary font-bold transition-colors">−</button>
                <span className="flex-1 text-center font-body font-semibold text-primary text-sm">{qty}</span>
                <button onClick={() => setQty(q => Math.min(stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-primary font-bold transition-colors">+</button>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-1">
              <button onClick={handleAddToCart} disabled={loading || stock <= 0}
                className="w-full py-3 bg-primary text-white rounded-xl font-body font-semibold text-sm hover:bg-secondary transition-colors duration-300 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : stock <= 0 ? 'Out of Stock' : '🛍️ Add to Cart'}
              </button>

              <div className="flex gap-2">
                <button onClick={handleWishlist} disabled={wishLoading}
                  className={`flex-1 py-2.5 rounded-xl border font-body font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                    isInWishlist ? 'bg-sale/10 border-sale text-sale' : 'border-gray-200 text-gray-600 hover:border-sale hover:text-sale'
                  }`}>
                  {isInWishlist ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
                  {isInWishlist ? 'Saved' : 'Wishlist'}
                </button>
                <Link to={`/product/${slug}`} onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-body font-semibold text-sm text-center hover:border-secondary hover:text-secondary transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  , document.body);
};

export default QuickViewModal;