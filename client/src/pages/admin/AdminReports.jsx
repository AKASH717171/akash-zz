import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { HiDownload, HiChartBar, HiCurrencyDollar, HiShoppingCart, HiTrendingUp } from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#C4A35A', '#1A1A2E', '#E8D5B7', '#27AE60', '#E74C3C', '#3498DB'];

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-luxe px-4 py-3">
      <p className="font-body text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-heading font-bold text-primary text-sm">
          {p.name === 'revenue' || p.name === 'Revenue' ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [salesGraph, setSalesGraph] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, graphRes, topRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get(`/dashboard/sales-graph?days=${period}`),
        api.get('/dashboard/top-products'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data);
      if (graphRes.data.success) setSalesGraph(graphRes.data.data || []);
      if (topRes.data.success) setTopProducts(topRes.data.products || []);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exportCSV = () => {
    if (!salesGraph.length) return toast.error('No data to export');
    const csv = ['Date,Revenue,Orders', ...salesGraph.map((d) => `${d.date || d._id},${d.revenue || 0},${d.orders || 0}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `sales_report_${Date.now()}.csv`; a.click();
    toast.success('CSV exported!');
  };

  // Category data from stats
  const categoryData = stats?.categoryBreakdown || [
    { name: 'Women Fashion', value: 45 },
    { name: 'Bags', value: 30 },
    { name: 'Shoes', value: 25 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary">Reports & Analytics</h2>
          <p className="font-body text-sm text-gray-400">Sales performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-xl shadow-luxe p-1 gap-1">
            {['7', '30', '90'].map((d) => (
              <button key={d}
                onClick={() => setPeriod(d)}
                className={`px-3 py-1.5 rounded-lg font-body text-sm font-semibold transition-colors ${period === d ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'}`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-secondary text-secondary rounded-xl font-body text-sm font-semibold hover:bg-secondary/5 transition-colors">
            <HiDownload className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: fmt(stats.totalRevenue), icon: HiCurrencyDollar, color: 'bg-secondary/20 text-secondary' },
            { label: 'Total Orders', value: stats.totalOrders || 0, icon: HiShoppingCart, color: 'bg-blue-100 text-blue-600' },
            { label: `${period}d Revenue`, value: fmt(stats.periodRevenue), icon: HiTrendingUp, color: 'bg-green-100 text-green-600' },
            { label: 'Pending Orders', value: stats.pendingOrders || 0, icon: HiChartBar, color: 'bg-yellow-100 text-yellow-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-luxe p-5">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-heading text-2xl font-bold text-primary">{value}</div>
              <div className="font-body text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-luxe p-5">
        <h3 className="font-heading text-lg font-bold text-primary mb-4">Revenue — Last {period} Days</h3>
        {salesGraph.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesGraph} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4A35A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C4A35A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontFamily: 'Poppins', fontSize: 11 }} />
              <YAxis tick={{ fontFamily: 'Poppins', fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#C4A35A" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ r: 4, fill: '#C4A35A' }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-300 font-body">No sales data for this period</div>
        )}
      </div>

      {/* Orders Chart + Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders Bar Chart */}
        <div className="bg-white rounded-2xl shadow-luxe p-5">
          <h3 className="font-heading text-lg font-bold text-primary mb-4">Orders — Last {period} Days</h3>
          {salesGraph.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesGraph} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontFamily: 'Poppins', fontSize: 11 }} />
                <YAxis tick={{ fontFamily: 'Poppins', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="Orders" fill="#1A1A2E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-300 font-body">No data</div>
          )}
        </div>

        {/* Category Pie */}
        <div className="bg-white rounded-2xl shadow-luxe p-5">
          <h3 className="font-heading text-lg font-bold text-primary mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                paddingAngle={4} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="font-body text-xs text-gray-500">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-heading text-lg font-bold text-primary">Top Selling Products</h3>
        </div>
        {topProducts.length === 0 ? (
          <div className="p-8 text-center font-body text-gray-400">No sales data yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-4 px-5 py-3">
                <span className="font-heading font-bold text-2xl text-gray-200 w-6 text-center">{i + 1}</span>
                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-primary truncate">{p.title}</p>
                  <p className="font-body text-xs text-gray-400">{p.totalSold} units sold</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-heading font-bold text-secondary text-sm">{fmt(p.revenue)}</p>
                  <p className="font-body text-xs text-gray-400">revenue</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;