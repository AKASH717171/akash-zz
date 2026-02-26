import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineHeart, HiHeart, HiStar, HiShieldCheck, HiTruck,
  HiRefresh, HiChat, HiShare, HiMinus, HiPlus,
} from 'react-icons/hi';
import api from '../utils/api';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import Breadcrumb from '../components/common/Breadcrumb';
import ImageGallery from '../components/products/ImageGallery';
import ReviewSection from '../components/products/ReviewSection';
import RelatedProducts from '../components/products/RelatedProducts';
import toast from 'react-hot-toast';

const TABS = ['Description', 'Size Guide', 'Reviews', 'Shipping'];

const SizeGuideTable = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm font-body border-collapse">
      <thead>
        <tr className="bg-primary text-white">
          {['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)', 'Length (in)'].map(h => (
            <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[
          ['XS', '32-33', '25-26', '34-35', '38'],
          ['S',  '34-35', '27-28', '36-37', '39'],
          ['M',  '36-37', '29-30', '38-39', '40'],
          ['L',  '38-40', '31-33', '40-42', '41'],
          ['XL', '41-43', '34-36', '43-45', '42'],
          ['XXL','44-46', '37-39', '46-48', '43'],
        ].map(([size, ...vals], i) => (
          <tr key={size} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
            <td className="px-4 py-3 font-semibold text-primary">{size}</td>
            {vals.map((v, j) => <td key={j} className="px-4 py-3 text-gray-600">{v}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
    <p className="text-xs text-gray-400 mt-3 font-body">
      * Measurements are approximate. For the best fit, please refer to your own measurements.
    </p>
  </div>
);

const ShippingInfo = () => (
  <div className="space-y-4 font-body">
    {[
      { icon: '🚚', title: 'Standard Delivery (3-7 days)', desc: 'Free shipping on orders over $50. Flat $9.99 for orders below.', color: 'text-primary' },
      { icon: '⚡', title: 'Express Delivery (1-2 days)', desc: '$19.99 flat rate. Available nationwide across USA.', color: 'text-secondary' },
      { icon: '📦', title: 'Order Tracking', desc: 'You will receive a tracking number via SMS & email once your order is shipped.', color: 'text-primary' },
      { icon: '↩️', title: 'Easy Returns (30 Days)', desc: 'Not satisfied? Return within 30 days of delivery. Items must be unworn with tags.', color: 'text-primary' },
    ].map(({ icon, title, desc, color }) => (
      <div key={title} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div>
          <h4 className={`font-semibold text-sm ${color} mb-1`}>{title}</h4>
          <p className="text-gray-500 text-sm">{desc}</p>
        </div>
      </div>
    ))}
  </div>
);

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user, refreshUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Description');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        if (data.success) {
          setProduct(data.product);
          // Pre-select first options
          if (data.product.colors?.length) setSelectedColor(data.product.colors[0]);
          if (data.product.sizes?.length) setSelectedSize(data.product.sizes[0]);
          // Recently viewed
          try {
            const existing = JSON.parse(localStorage.getItem('luxe_recently_viewed') || '[]');
            const updated = [data.product._id, ...existing.filter(id => id !== data.product._id)].slice(0, 10);
            localStorage.setItem('luxe_recently_viewed', JSON.stringify(updated));
          } catch { /* ignore */ }
        } else {
          navigate('/shop');
        }
      } catch {
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug, navigate]);

  const isInWishlist = isAuthenticated && user?.wishlist?.some(
    id => (id?._id || id)?.toString() === product?._id
  );

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); navigate('/login'); return; }
    if (product?.stock <= 0) { toast.error('Out of stock'); return; }
    setCartLoading(true);
    const result = await addToCart(product._id, qty, selectedSize?.name || selectedSize, selectedColor?.name || selectedColor);
    if (result.success) {
      toast.success('Added to cart! 🛍️', { duration: 3000 });
    } else {
      toast.error(result.message || 'Failed to add');
    }
    setCartLoading(false);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setCartLoading(true);
    const result = await addToCart(product._id, qty, selectedSize?.name || selectedSize, selectedColor?.name || selectedColor);
    if (result.success) {
      navigate('/checkout');
    } else {
      toast.error(result.message || 'Failed');
    }
    setCartLoading(false);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    setWishLoading(true);
    try {
      const { data } = await api.post('/wishlist/toggle', { productId: product._id });
      if (data.success) { toast.success(data.message); refreshUser?.(); }
    } catch { toast.error('Failed'); }
    finally { setWishLoading(false); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-12 skeleton w-full" />
        <div className="container-luxe py-8">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <div className="aspect-[3/4] skeleton rounded-2xl" />
              <div className="flex gap-2">
                {[1,2,3,4].map(i => <div key={i} className="w-20 h-20 skeleton rounded-xl flex-shrink-0" />)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="skeleton h-5 w-24 rounded" />
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-6 w-1/2 rounded" />
              <div className="skeleton h-10 w-32 rounded" />
              <div className="skeleton h-12 w-full rounded-xl" />
              <div className="skeleton h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const {
    title, images = [], regularPrice, salePrice, discountPercent,
    sizes = [], colors = [], stock, ratings, descriptions,
    description, shortDescription,
    category, tags = [], sku,
  } = product;

  const isOnSale = salePrice && salePrice < regularPrice;
  const currentPrice = isOnSale ? salePrice : regularPrice;
  const savings = isOnSale ? regularPrice - salePrice : 0;
  const discount = discountPercent || (isOnSale ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0);
  const isOutOfStock = stock <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb
        items={[
          { label: 'Shop', path: '/shop' },
          ...(category ? [{ label: category.name, path: `/category/${category.slug}` }] : []),
          { label: title },
        ]}
      />

      <div className="container-luxe py-8 md:py-12">
        {/* Main Product Section */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">

          {/* ========== LEFT: Image Gallery ========== */}
          <div>
            <ImageGallery images={images} title={title} />
          </div>

          {/* ========== RIGHT: Product Info ========== */}
          <div className="space-y-5">
            {/* Category & Tags */}
            <div className="flex items-center flex-wrap gap-2">
              {category && (
                <Link
                  to={`/category/${category.slug}`}
                  className="font-body text-xs text-secondary font-semibold uppercase tracking-widest hover:underline"
                >
                  {category.name}
                </Link>
              )}
              {tags.slice(0, 3).map(tag => (
                <span key={tag} className="font-body text-xs bg-accent/50 text-primary/60 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-primary leading-snug">
              {title}
            </h1>

            {/* Rating */}
            {ratings?.count > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <HiStar key={s} className={`w-4 h-4 md:w-5 md:h-5 ${s <= Math.round(ratings.average) ? 'text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="font-body text-sm font-semibold text-primary">{ratings.average?.toFixed(1)}</span>
                <button
                  onClick={() => setActiveTab('Reviews')}
                  className="font-body text-sm text-gray-400 hover:text-secondary underline transition-colors"
                >
                  ({ratings.count} reviews)
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('Reviews')}
                className="font-body text-sm text-gray-400 hover:text-secondary transition-colors"
              >
                ⭐ Be the first to review
              </button>
            )}

            {/* Price */}
            <div className="bg-accent/20 rounded-2xl p-4 border border-accent">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-heading text-3xl md:text-4xl font-bold text-primary">
                  ${currentPrice?.toFixed(2)}
                </span>
                {isOnSale && (
                  <span className="font-body text-base text-gray-400 line-through">
                    ${regularPrice?.toFixed(2)}
                  </span>
                )}
              </div>
              {isOnSale && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="bg-sale text-white text-xs font-bold font-body px-2.5 py-1 rounded-lg">
                    {discount}% OFF
                  </span>
                  <span className="font-body text-sm text-sale font-semibold">
                    You save ${savings?.toFixed(2)}!
                  </span>
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-sale' : stock < 10 ? 'bg-yellow-400' : 'bg-success'}`} />
              <span className="font-body text-sm font-medium text-gray-600">
                {isOutOfStock ? 'Out of Stock' : stock < 10 ? `Only ${stock} left in stock!` : 'In Stock'}
              </span>
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div>
                <p className="font-body text-sm font-semibold text-primary mb-2.5">
                  Color: <span className="text-secondary capitalize font-medium">{selectedColor?.name || selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color.name || color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl border text-sm font-body font-medium capitalize transition-all duration-200 ${
                        (selectedColor?.name || selectedColor) === (color?.name || color)
                          ? 'bg-primary text-white border-primary shadow-luxe scale-105'
                          : 'border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary'
                      }`}
                    >
                      {color.name || color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="font-body text-sm font-semibold text-primary">
                    Size: <span className="text-secondary font-medium">{selectedSize?.name || selectedSize}</span>
                  </p>
                  <button
                    onClick={() => setActiveTab('Size Guide')}
                    className="font-body text-xs text-secondary hover:underline"
                  >
                    Size Guide →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size.name || size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] px-4 py-2.5 rounded-xl border text-sm font-body font-bold transition-all duration-200 ${
                        (selectedSize?.name || selectedSize) === (size?.name || size)
                          ? 'bg-primary text-white border-primary shadow-luxe'
                          : 'border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary'
                      }`}
                    >
                      {size.name || size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="font-body text-sm font-semibold text-primary mb-2">Quantity</p>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-36">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-primary"
                  >
                    <HiMinus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-body font-bold text-primary">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(Math.max(stock, 1), q + 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-primary"
                  >
                    <HiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Wishlist */}
              <div className="mt-6">
                <button
                  onClick={handleWishlist}
                  disabled={wishLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-body
                             font-semibold transition-all duration-200 ${
                    isInWishlist
                      ? 'bg-sale/10 border-sale text-sale'
                      : 'border-gray-200 text-gray-500 hover:border-sale hover:text-sale'
                  }`}
                >
                  {isInWishlist
                    ? <HiHeart className="w-4 h-4" />
                    : <HiOutlineHeart className="w-4 h-4" />}
                  {isInWishlist ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || isOutOfStock}
                className={`w-full py-4 rounded-xl font-body font-bold text-base transition-all duration-300
                           flex items-center justify-center gap-2 shadow-luxe ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-secondary hover:shadow-gold'
                }`}
              >
                {cartLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>{isOutOfStock ? '❌ Out of Stock' : '🛍️ Add to Cart'}</>
                )}
              </button>

              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  disabled={cartLoading}
                  className="w-full py-4 rounded-xl bg-secondary text-white font-body font-bold text-base
                             hover:bg-secondary-600 transition-all duration-300 flex items-center justify-center
                             gap-2 shadow-gold"
                >
                  ⚡ Buy Now
                </button>
              )}

            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              {[
                { icon: HiTruck, label: 'Free Shipping', sub: 'On $50+' },
                { icon: HiRefresh, label: 'Easy Returns', sub: '30-day policy' },
                { icon: HiShieldCheck, label: '100% Secure', sub: 'Safe checkout' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5 p-3 bg-gray-50 rounded-xl">
                  <Icon className="w-5 h-5 text-secondary" />
                  <span className="font-body text-xs font-semibold text-primary leading-tight">{label}</span>
                  <span className="font-body text-[10px] text-gray-400">{sub}</span>
                </div>
              ))}
            </div>

            {/* SKU */}
            {sku && (
              <p className="font-body text-xs text-gray-400">SKU: {sku}</p>
            )}
          </div>
        </div>

        {/* ========== TABS SECTION ========== */}
        <div className="mt-14">
          {/* Tab Nav */}
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-6 py-3.5 font-body font-semibold text-sm transition-all duration-200 border-b-2 ${
                  activeTab === tab
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-gray-500 hover:text-primary'
                }`}
              >
                {tab}
                {tab === 'Reviews' && ratings?.count > 0 && (
                  <span className="ml-2 text-xs bg-secondary/10 text-secondary rounded-full px-1.5 py-0.5">
                    {ratings.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-8 animate-fade-in">
            {activeTab === 'Description' && (
              <div className="max-w-3xl">
                {(descriptions?.long || description) ? (
                  <div
                    className="prose prose-sm max-w-none font-body text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: descriptions?.long || description }}
                  />
                ) : (
                  <p className="font-body text-gray-600 leading-relaxed">
                    {descriptions?.short || shortDescription || 'No description available for this product.'}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'Size Guide' && (
              <div className="max-w-2xl">
                <h3 className="font-heading text-xl font-bold text-primary mb-5">Size Guide</h3>
                <SizeGuideTable />
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div className="max-w-3xl">
                <ReviewSection productId={product._id} ratings={ratings} />
              </div>
            )}

            {activeTab === 'Shipping' && (
              <div className="max-w-2xl">
                <h3 className="font-heading text-xl font-bold text-primary mb-5">Shipping & Returns</h3>
                <ShippingInfo />
              </div>
            )}
          </div>
        </div>

        {/* ========== RELATED PRODUCTS ========== */}
        <RelatedProducts
          productId={product._id}
          categorySlug={category?.slug}
        />

        {/* ========== RECENTLY VIEWED ========== */}
        <RecentlyViewedSection currentProductId={product._id} />
      </div>
    </div>
  );
};

// Recently Viewed Component
const RecentlyViewedSection = ({ currentProductId }) => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        const ids = JSON.parse(localStorage.getItem('luxe_recently_viewed') || '[]')
          .filter(id => id !== currentProductId)
          .slice(0, 8);
        if (!ids.length) return;
        const { data } = await api.get(`/products?ids=${ids.join(',')}&limit=8`);
        if (data.success) setRecentProducts(data.products || []);
      } catch { /* ignore */ }
    };
    loadRecentlyViewed();
  }, [currentProductId]);

  if (!recentProducts.length) return null;

  return (
    <div className="mt-16 pb-12">
      <h2 className="font-heading text-2xl font-bold text-primary mb-6">
        🕐 Recently Viewed
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {recentProducts.map(p => {
          const price = p.salePrice || p.regularPrice;
          const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
          return (
            <Link
              key={p._id}
              to={`/product/${p.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-luxe transition-all duration-300"
            >
              <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                <img
                  src={img}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <h4 className="font-body text-xs font-semibold text-primary line-clamp-2 leading-snug">{p.title}</h4>
                <p className="font-body text-sm font-bold text-secondary mt-1">${price?.toFixed(2)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductDetail;