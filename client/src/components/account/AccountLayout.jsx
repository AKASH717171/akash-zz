import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlineHeart,
  HiOutlineLocationMarker,
  HiCog,
  HiOutlineLogout,
  HiOutlineHome,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import Header from '../common/Header';
import Footer from '../common/Footer';

const AccountLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarLinks = [
    {
      name: 'Dashboard',
      path: '/account',
      icon: HiOutlineHome,
    },
    {
      name: 'My Orders',
      path: '/account/orders',
      icon: HiOutlineClipboardList,
    },
    {
      name: 'Wishlist',
      path: '/account/wishlist',
      icon: HiOutlineHeart,
    },
    {
      name: 'Addresses',
      path: '/account/addresses',
      icon: HiOutlineLocationMarker,
    },
    {
      name: 'Profile Settings',
      path: '/account/profile',
      icon: HiCog,
    },
  ];

  const isActive = (path) => {
    if (path === '/account') {
      return location.pathname === '/account';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm font-body text-gray-500">
            <Link to="/" className="hover:text-secondary transition-colors">
              Home
            </Link>
            <HiOutlineChevronRight className="w-3 h-3" />
            <span className="text-primary font-medium">{title || 'My Account'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-luxe overflow-hidden sticky top-24">
              {/* User Info */}
              <div className="p-6 bg-gradient-luxe text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-secondary/20 border-2 border-secondary flex items-center justify-center">
                    <span className="text-xl font-heading font-bold text-secondary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-white text-lg truncate">
                      {user?.name}
                    </h3>
                    <p className="text-gray-400 text-xs font-body truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="p-3">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 font-body text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-secondary/10 text-secondary border-l-4 border-secondary pl-3'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-secondary' : ''}`} />
                      {link.name}
                    </Link>
                  );
                })}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm font-medium text-sale hover:bg-red-50 transition-all duration-200 w-full mt-2 border-t border-gray-100 pt-3"
                >
                  <HiOutlineLogout className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountLayout;