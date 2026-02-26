import React, { useState, useEffect, useCallback } from 'react';
import { HiMail, HiTrash, HiDownload, HiSearch, HiX } from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState({});

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/newsletter/admin/all');
      if (data.success) setSubscribers(data.subscribers || []);
    } catch { toast.error('Failed to fetch subscribers'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Remove ${email} from newsletter?`)) return;
    setDeleting((d) => ({ ...d, [id]: true }));
    try {
      await api.delete(`/newsletter/${id}`);
      toast.success('Subscriber removed');
      setSubscribers((prev) => prev.filter((s) => s._id !== id));
    } catch { toast.error('Delete failed'); }
    finally { setDeleting((d) => ({ ...d, [id]: false })); }
  };

  const exportCSV = async () => {
    try {
      const { data } = await api.get('/newsletter/admin/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `newsletter_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported!');
    } catch {
      // Fallback: generate CSV from current data
      const csv = ['Email,Status,Subscribed At', ...subscribers.map((s) =>
        `${s.email},${s.status},${new Date(s.subscribedAt || s.createdAt).toLocaleDateString()}`
      )].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `newsletter_${Date.now()}.csv`; a.click();
      toast.success('CSV exported!');
    }
  };

  const filtered = subscribers.filter((s) => s.email?.toLowerCase().includes(search.toLowerCase()));
  const activeCount = subscribers.filter((s) => s.status === 'active' || !s.status).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary">Newsletter</h2>
          <p className="font-body text-sm text-gray-400">
            {loading ? '...' : `${subscribers.length} total · ${activeCount} active`}
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 border border-secondary text-secondary rounded-xl font-body text-sm font-semibold hover:bg-secondary/5 transition-colors"
        >
          <HiDownload className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Subscribers', value: subscribers.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active', value: activeCount, color: 'bg-green-50 text-green-600' },
          { label: 'Unsubscribed', value: subscribers.length - activeCount, color: 'bg-gray-50 text-gray-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-luxe p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
              <HiMail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-heading text-2xl font-bold text-primary">{value}</div>
              <div className="font-body text-xs text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-luxe p-4">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <HiX className="w-4 h-4" />
            </button>
          )}
        </div>
        {search && (
          <p className="font-body text-xs text-gray-400 mt-2">{filtered.length} results for "{search}"</p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <HiMail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-body text-gray-400">{search ? 'No results found' : 'No subscribers yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#', 'Email', 'Status', 'Subscribed At', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((sub, i) => (
                  <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-body text-sm text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent/40 flex items-center justify-center">
                          <HiMail className="w-4 h-4 text-secondary" />
                        </div>
                        <span className="font-body text-sm font-semibold text-primary">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                        sub.status === 'active' || !sub.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sub.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-gray-400">
                      {new Date(sub.subscribedAt || sub.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(sub._id, sub.email)}
                        disabled={deleting[sub._id]}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-red-400 disabled:opacity-40"
                      >
                        {deleting[sub._id]
                          ? <div className="w-3 h-3 border-2 border-red-200 border-t-red-400 rounded-full animate-spin" />
                          : <HiTrash className="w-4 h-4" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter;