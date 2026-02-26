import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HiViewGrid, HiShoppingBag, HiTag, HiClipboardList,
  HiUsers, HiTicket, HiChat, HiStar, HiPhotograph,
  HiDocumentText, HiMail, HiChartBar, HiCog,
  HiLogout, HiMenuAlt2, HiX, HiBell, HiChevronLeft,
  HiTruck,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';

const MENU = [
  { label: 'Dashboard',   path: '/admin',                icon: HiViewGrid },
  { label: 'Products',    path: '/admin/products',       icon: HiShoppingBag },
  { label: 'Categories',  path: '/admin/categories',     icon: HiTag },
  { label: 'Orders',      path: '/admin/orders',         icon: HiClipboardList },
  { label: 'Shipping Info', path: '/admin/shipping-info',  icon: HiTruck },
  { label: 'Customers',   path: '/admin/customers',      icon: HiUsers },
  { label: 'Coupons',     path: '/admin/coupons',        icon: HiTicket },
  { label: 'Live Chat',   path: '/admin/chat',           icon: HiChat },
  { label: 'Reviews',     path: '/admin/reviews',        icon: HiStar },
  { label: 'Media',       path: '/admin/media',          icon: HiPhotograph },
  { label: 'Newsletter',  path: '/admin/newsletter',     icon: HiMail },
  { label: 'Reports',     path: '/admin/reports',        icon: HiChartBar },
  { label: 'Settings',    path: '/admin/settings',       icon: HiCog },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0 shadow-gold">
          <span className="font-heading font-bold text-white text-base">L</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-heading font-bold text-white text-sm leading-none">LUXE FASHION</p>
            <p className="font-body text-white/40 text-xs mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {MENU.map(({ label, path, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? label : ''}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              isActive(path)
                ? 'bg-secondary text-white shadow-gold'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-body text-sm font-medium">{label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div className={`border-t border-white/10 p-4 space-y-2`}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-secondary/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-body font-bold text-secondary text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-body text-white text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
              <p className="font-body text-white/40 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60
                     hover:bg-sale/20 hover:text-sale transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <HiLogout className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-body text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-primary transition-all duration-300 ease-in-out flex-shrink-0 ${
          collapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-60 bg-primary z-50 lg:hidden animate-slide-in-left">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3.5 flex items-center gap-4 flex-shrink-0 shadow-sm">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <HiMenuAlt2 className="w-5 h-5 text-gray-600" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <HiChevronLeft className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Page Title */}
          <div className="flex-1">
            <h1 className="font-heading font-bold text-primary text-lg leading-none">
              {MENU.find(m => isActive(m.path))?.label || 'Admin'}
            </h1>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
              <HiBell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sale rounded-full" />
            </button>
            <Link
              to="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl
                         font-body text-xs font-semibold hover:bg-secondary transition-colors"
            >
              View Store ↗
            </Link>
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="font-body font-bold text-secondary text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;