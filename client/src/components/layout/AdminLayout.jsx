import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HiOutlineHome, HiOutlineShoppingBag, HiOutlineTag,
  HiOutlineClipboardList, HiOutlineUsers, HiOutlineTicket,
  HiOutlineStar, HiOutlinePhotograph, HiOutlineChatAlt2,
  HiOutlineMail, HiCog, HiOutlineLogout, HiOutlineMenu,
  HiOutlineX, HiOutlineChevronLeft,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';

const MENU = [
  { name: 'Dashboard', path: '/admin', icon: HiOutlineHome, exact: true },
  { name: 'Products', path: '/admin/products', icon: HiOutlineShoppingBag },
  { name: 'Categories', path: '/admin/categories', icon: HiOutlineTag },
  { name: 'Orders', path: '/admin/orders', icon: HiOutlineClipboardList },
  { name: 'Customers', path: '/admin/customers', icon: HiOutlineUsers },
  { name: 'Coupons', path: '/admin/coupons', icon: HiOutlineTicket },
  { name: 'Reviews', path: '/admin/reviews', icon: HiOutlineStar },
  { name: 'Banners', path: '/admin/banners', icon: HiOutlinePhotograph },
  { name: 'Live Chat', path: '/admin/chat', icon: HiOutlineChatAlt2 },
  { name: 'Newsletter', path: '/admin/newsletter', icon: HiOutlineMail },
  { name: 'Settings', path: '/admin/settings', icon: HiCog },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        {!collapsed && (
          <Link to="/admin" className="font-heading text-xl font-bold text-white">
            LUXE <span className="text-secondary">ADMIN</span>
          </Link>
        )}
        <button
          onClick={() => collapsed ? setCollapsed(false) : setCollapsed(true)}
          className="hidden lg:flex w-7 h-7 rounded bg-white/10 items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <HiOutlineChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-200 group ${
                active
                  ? 'bg-secondary text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 px-4 py-4">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="text-secondary text-sm font-bold">{user?.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Link to="/" className="flex-1 text-center text-xs text-gray-400 hover:text-white py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors">
            View Store
          </Link>
          <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-sale rounded bg-white/5 hover:bg-white/10 transition-colors" title="Logout">
            <HiOutlineLogout className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 bg-primary z-30 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-primary z-50 flex flex-col animate-slide-in-left lg:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {/* Admin Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-14 flex items-center px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-primary"
          >
            <HiOutlineMenu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-400 font-body">Admin Panel</span>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;