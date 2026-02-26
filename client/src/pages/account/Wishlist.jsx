import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiShoppingBag, HiTrash } from 'react-icons/hi';
import useWishlist from '../../hooks/useWishlist';
import useCart from '../../hooks/useCart';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (result.success) toast.success('Added to cart! 🛍️');
    else toast.error(result.message || 'Failed');
  };

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-luxe">
            <div className="aspect-[3/4] skeleton" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-5 w-1/2 rounded" />
              <div className="skeleton h-9 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-accent/30 rounded-full flex items-center justify-center mb-5">
          <HiOutlineHeart className="w-12 h-12 text-secondary/40" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-primary mb-2">Your Wishlist is Empty</h3>
        <p className="font-body text-gray-500 mb-6 max-w-sm">
          Save your favourite items here so you never lose track of what you love.
        </p>
        <Link
          to="/shop"
          className="px-7 py-3.5 bg-primary text-white rounded-xl font-body font-semibold
                     hover:bg-secondary transition-colors duration-300 shadow-luxe"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-primary">
          My Wishlist
          <span className="ml-2 font-body text-base font-normal text-gray-400">
            ({wishlist.length} item{wishlist.length !== 1 ? 's' : ''})
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.map((item) => {
          const product = item.product || item;
          const mainImg = product.images?.find(img => img.isMain) || product.images?.[0];
          const isOnSale = product.salePrice && product.salePrice < product.regularPrice;
          const price = isOnSale ? product.salePrice : product.regularPrice;
          const discount = isOnSale
            ? product.discountPercent || Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
            : 0;

          return (
            <div key={product._id} className="bg-white rounded-xl overflow-hidden shadow-luxe group">
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <Link to={`/product/${product.slug}`}>
                  <img
                    src={mainImg?.url || '/placeholder.jpg'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                {isOnSale && (
                  <div className="absolute top-2 left-2 bg-sale text-white text-xs font-bold px-2 py-1 rounded-lg font-body">
                    {discount}% OFF
                  </div>
                )}
                <button
                  onClick={() => handleRemove(product._id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center
                             shadow-luxe hover:bg-sale hover:text-white text-gray-400 transition-all duration-200
                             opacity-0 group-hover:opacity-100"
                  title="Remove from wishlist"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2.5">
                <Link to={`/product/${product.slug}`}>
                  <h3 className="font-body text-sm font-semibold text-primary line-clamp-2 hover:text-secondary transition-colors">
                    {product.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-primary">
                    ${price?.toFixed(2)}
                  </span>
                  {isOnSale && (
                    <span className="font-body text-xs text-gray-400 line-through">
                      ${product.regularPrice?.toFixed(2)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product._id)}
                  className="w-full py-2.5 bg-primary text-white rounded-xl font-body font-semibold text-xs
                             hover:bg-secondary transition-colors duration-300 flex items-center justify-center gap-1.5"
                >
                  <HiShoppingBag className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;