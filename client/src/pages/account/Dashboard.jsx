import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineTruck,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import AccountLayout from '../../components/account/AccountLayout';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/dashboard-stats');
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-indigo-100 text-indigo-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return `$${price?.toFixed(2) || '0.00'}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <AccountLayout title="Dashboard">
        <Loader text="Loading dashboard..." />
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Dashboard">
      <div className="animate-fade-in">
        {/* Welcome Section */}
        <div className="bg-gradient-luxe rounded-xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <p className="text-secondary text-sm font-body font-medium mb-1">
              {getGreeting()} ✨
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
              Hello, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-400 font-body text-sm max-w-lg">
              Welcome to your LUXE FASHION dashboard. Manage your orders, wishlist, and account settings from here.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-luxe p-5 sm:p-6 transition-all duration-300 hover:shadow-luxe-lg group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <HiOutlineShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-primary">
              {stats?.totalOrders || 0}
            </p>
            <p className="text-xs text-gray-500 font-body mt-1">Total Orders</p>
          </div>

          <div className="bg-white rounded-xl shadow-luxe p-5 sm:p-6 transition-all duration-300 hover:shadow-luxe-lg group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <HiOutlineClock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-primary">
              {stats?.pendingOrders || 0}
            </p>
            <p className="text-xs text-gray-500 font-body mt-1">Pending Orders</p>
          </div>

          <div className="bg-white rounded-xl shadow-luxe p-5 sm:p-6 transition-all duration-300 hover:shadow-luxe-lg group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                <HiOutlineHeart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-primary">
              {stats?.wishlistCount || 0}
            </p>
            <p className="text-xs text-gray-500 font-body mt-1">Wishlist Items</p>
          </div>

          <div className="bg-white rounded-xl shadow-luxe p-5 sm:p-6 transition-all duration-300 hover:shadow-luxe-lg group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <HiOutlineCurrencyDollar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-primary">
              {formatPrice(stats?.totalSpent)}
            </p>
            <p className="text-xs text-gray-500 font-body mt-1">Total Spent</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-luxe overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-primary">
                Recent Orders
              </h2>
              <p className="text-xs text-gray-500 font-body mt-0.5">
                Your last 5 orders
              </p>
            </div>
            <Link
              to="/account/orders"
              className="text-sm text-secondary hover:text-secondary-600 font-body font-medium flex items-center gap-1 transition-colors"
            >
              View All
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-body font-semibold text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-body font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-body font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-body font-semibold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-body font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-body font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-body font-semibold text-primary">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-600 font-body">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-600 font-body">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-body font-semibold text-primary">
                          {formatPrice(order.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body font-medium capitalize ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus === 'delivered' && <HiOutlineCheckCircle className="w-3.5 h-3.5" />}
                          {order.orderStatus === 'shipped' && <HiOutlineTruck className="w-3.5 h-3.5" />}
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/account/orders/${order._id}`}
                          className="inline-flex items-center gap-1 text-sm text-secondary hover:text-secondary-600 font-body font-medium transition-colors"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <HiOutlineShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-primary mb-2">
                No orders yet
              </h3>
              <p className="text-gray-500 font-body text-sm mb-6">
                When you place orders, they will appear here.
              </p>
              <Link
                to="/shop"
                className="btn-secondary inline-flex items-center gap-2 text-sm py-2.5 px-6 rounded-lg"
              >
                Start Shopping
                <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Link
            to="/shop"
            className="bg-white rounded-xl shadow-luxe p-6 flex items-center gap-4 hover:shadow-luxe-lg transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <HiOutlineShoppingBag className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-primary text-sm">
                Continue Shopping
              </h3>
              <p className="text-xs text-gray-500 font-body">
                Explore new arrivals
              </p>
            </div>
            <HiOutlineArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-secondary group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/account/wishlist"
            className="bg-white rounded-xl shadow-luxe p-6 flex items-center gap-4 hover:shadow-luxe-lg transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-lg bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
              <HiOutlineHeart className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-primary text-sm">
                My Wishlist
              </h3>
              <p className="text-xs text-gray-500 font-body">
                {stats?.wishlistCount || 0} saved items
              </p>
            </div>
            <HiOutlineArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/account/profile"
            className="bg-white rounded-xl shadow-luxe p-6 flex items-center gap-4 hover:shadow-luxe-lg transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <HiCog className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-primary text-sm">
                Account Settings
              </h3>
              <p className="text-xs text-gray-500 font-body">
                Update your profile
              </p>
            </div>
            <HiOutlineArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </AccountLayout>
  );
};

export default Dashboard;