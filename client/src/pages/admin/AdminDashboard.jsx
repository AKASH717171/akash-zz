import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
  HiCurrencyDollar, HiShoppingCart, HiUsers, HiShoppingBag,
  HiArrowUp, HiArrowDown, HiEye, HiChat,
} from 'react-icons/hi';
import api from '../../utils/api';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  inTransit:  'bg-orange-100 text-orange-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const StatCard = ({ title, value, sub, icon: Icon, color, trend, loading }) => (
  <div className="bg-white rounded-2xl p-5 shadow-luxe">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-body font-semibold px-2 py-1 rounded-full ${
          trend >= 0 ? 'bg-success/10 text-success' : 'bg-sale/10 text-sale'
        }`}>
          {trend >= 0 ? <HiArrowUp className="w-3 h-3" /> : <HiArrowDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    {loading ? (
      <>
        <div className="skeleton h-7 w-24 rounded mb-2" />
        <div className="skeleton h-4 w-32 rounded" />
      </>
    ) : (
      <>
        <div className="font-heading text-2xl md:text-3xl font-bold text-primary">{value}</div>
        <div className="font-body text-sm text-gray-400 mt-1">{sub}</div>
      </>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-luxe px-4 py-3">
      <p className="font-body text-xs text-gray-400 mb-1">{label}</p>
      <p className="font-heading font-bold text-primary text-sm">
        ${payload[0]?.value?.toLocaleString()}
      </p>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statsRes, salesRes, ordersRes, topRes, stockRes] = await Promise.all([
          api.get('/orders/admin/stats'),
          api.get(`/orders/admin/sales-graph?days=${period}`),
          api.get('/orders/admin/all?limit=10&page=1'),
          api.get('/orders/admin/top-products'),
          api.get('/products/admin/all?lowStock=true&limit=5'),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (salesRes.data.success) setSalesData(salesRes.data.data || []);
        if (ordersRes.data.success) setRecentOrders(ordersRes.data.orders || []);
        if (topRes.data.success) setTopProducts(topRes.data.products || []);
        if (stockRes.data.success) setLowStock(stockRes.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [period]);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      sub: `$${(stats?.todayRevenue || 0).toLocaleString()} today`,
      icon: HiCurrencyDollar,
      color: 'bg-secondary',
      trend: stats?.revenueTrend,
    },
    {
      title: 'Total Orders',
      value: (stats?.totalOrders || 0).toLocaleString(),
      sub: `${stats?.todayOrders || 0} today`,
      icon: HiShoppingCart,
      color: 'bg-blue-500',
      trend: stats?.orderTrend,
    },
    {
      title: 'Customers',
      value: (stats?.totalCustomers || 0).toLocaleString(),
      sub: `${stats?.newCustomers || 0} this month`,
      icon: HiUsers,
      color: 'bg-purple-500',
      trend: stats?.customerTrend,
    },
    {
      title: 'Products',
      value: (stats?.totalProducts || 0).toLocaleString(),
      sub: `${stats?.lowStockCount || 0} low stock`,
      icon: HiShoppingBag,
      color: 'bg-primary',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {statCards.map(card => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-luxe p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-bold text-primary">Sales Overview</h3>
            <div className="flex gap-2">
              {[['7', '7 Days'], ['30', '30 Days']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setPeriod(val)}
                  className={`px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-colors ${
                    period === val
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-48 skeleton rounded-xl" />
          ) : salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C4A35A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C4A35A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'Poppins' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Poppins' }} width={60}
                  tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="revenue"
                  stroke="#C4A35A" strokeWidth={2.5}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 font-body text-sm">
              No sales data available
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-luxe p-5">
          <h3 className="font-heading font-bold text-primary mb-5">Top Products</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-10 h-10 skeleton rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 font-body text-sm">No data yet</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item, i) => {
                const img = item.images?.find(x => x.isMain) || item.images?.[0];
                return (
                  <div key={item._id} className="flex items-center gap-3">
                    <span className="font-body text-xs font-bold text-gray-300 w-4 flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={img?.url || '/placeholder.jpg'} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs font-semibold text-primary line-clamp-1">{item.title}</p>
                      <p className="font-body text-xs text-secondary font-bold">
                        {item.totalSold || 0} sold
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-luxe overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-heading font-bold text-primary">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="font-body text-xs text-secondary hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="skeleton h-10 rounded-xl" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 font-body text-sm">No orders yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    {['Order', 'Customer', 'Total', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-body font-semibold text-xs text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-body font-bold text-primary text-xs">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-3 font-body text-gray-600 text-xs">
                        {order.user?.name || 'Guest'}
                      </td>
                      <td className="px-4 py-3 font-body font-semibold text-primary text-xs">
                        ${order.total?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-body text-[10px] font-bold px-2 py-1 rounded-full ${
                          STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-secondary hover:text-secondary-600 transition-colors"
                        >
                          <HiEye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock + Chat */}
        <div className="space-y-5">
          {/* Low Stock */}
          <div className="bg-white rounded-2xl shadow-luxe p-5">
            <h3 className="font-heading font-bold text-primary mb-4 flex items-center gap-2">
              ⚠️ Low Stock
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="skeleton h-8 rounded-xl" />
                ))}
              </div>
            ) : lowStock.length === 0 ? (
              <p className="font-body text-sm text-gray-400 text-center py-4">All products are well stocked ✅</p>
            ) : (
              <div className="space-y-2.5">
                {lowStock.map(product => (
                  <div key={product._id} className="flex items-center justify-between">
                    <p className="font-body text-xs font-semibold text-primary line-clamp-1 flex-1 mr-2">
                      {product.title}
                    </p>
                    <span className={`font-body text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                      product.stock === 0
                        ? 'bg-sale/10 text-sale'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.stock === 0 ? 'Out' : `${product.stock} left`}
                    </span>
                  </div>
                ))}
                <Link
                  to="/admin/products?filter=lowStock"
                  className="block text-center font-body text-xs text-secondary hover:underline mt-2"
                >
                  View All Low Stock →
                </Link>
              </div>
            )}
          </div>

          {/* Chat Widget */}
          <div className="bg-primary rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <HiChat className="w-5 h-5 text-secondary" />
              <h3 className="font-heading font-bold">Live Chat</h3>
            </div>
            <p className="font-body text-white/60 text-xs mb-4">
              {stats?.unreadChats > 0
                ? `You have ${stats.unreadChats} unread message${stats.unreadChats !== 1 ? 's' : ''}!`
                : 'No new messages'}
            </p>
            <Link
              to="/admin/chat"
              className="block w-full text-center py-2.5 bg-secondary text-white rounded-xl
                         font-body font-semibold text-sm hover:bg-secondary-600 transition-colors"
            >
              Open Chat Panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;