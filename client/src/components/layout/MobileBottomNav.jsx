import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineHome, HiOutlineSearch, HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser } from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';

const MobileBottomNav = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();

  if (location.pathname.startsWith('/admin')) return null;

  const items = [
    { icon: HiOutlineHome, label: 'Home', path: '/' },
    { icon: HiOutlineSearch, label: 'Search', path: '/search' },
    { icon: HiOutlineShoppingBag, label: 'Cart', path: '/cart', badge: cartCount },
    { icon: HiOutlineHeart, label: 'Wishlist', path: isAuthenticated ? '/account/wishlist' : '/login', badge: user?.wishlist?.length || 0 },
    { icon: HiOutlineUser, label: 'Account', path: isAuthenticated ? '/account' : '/login' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full relative transition-colors ${
                active ? 'text-secondary' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-sale text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-body font-medium">{item.label}</span>
              {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-secondary rounded-full" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;