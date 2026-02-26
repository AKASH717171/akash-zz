import React, { useState, useEffect } from 'react';
import {
  HiSave, HiUpload, HiStore, HiMail, HiPhone, HiLocationMarker,
  HiGlobe, HiLockClosed, HiUserAdd,
} from 'react-icons/hi';
import api from '../../utils/api';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const TABS = ['Store Info', 'Shipping', 'Social Links', 'Admin Account', 'Add Admin'];

const INPUT = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20';

// ── Section wrapper ─────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-luxe p-6 space-y-5">
    <h3 className="font-heading text-lg font-bold text-primary border-b border-gray-100 pb-3">{title}</h3>
    {children}
  </div>
);

const AdminSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Store Info');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password change
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  // Add admin form
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [adminSaving, setAdminSaving] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => { if (data.success) setSettings(data.settings); })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const set = (path, value) => {
    setSettings((prev) => {
      const next = { ...prev };
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmNewPassword)
      return toast.error('All fields required');
    if (pwForm.newPassword !== pwForm.confirmNewPassword)
      return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6)
      return toast.error('New password must be at least 6 characters');
    setPwSaving(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) { toast.error(err.message || 'Failed to change password'); }
    finally { setPwSaving(false); }
  };

  const addAdmin = async () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password)
      return toast.error('All fields required');
    setAdminSaving(true);
    try {
      await api.post('/auth/register', { ...adminForm, confirmPassword: adminForm.password, role: 'admin' });
      toast.success(`Admin account created for ${adminForm.email}!`);
      setAdminForm({ name: '', email: '', password: '' });
    } catch (err) { toast.error(err.message || 'Failed to create admin'); }
    finally { setAdminSaving(false); }
  };

  const SaveBtn = ({ onClick, loading: l }) => (
    <button onClick={onClick} disabled={l}
      className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-xl font-body text-sm font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-60">
      {l ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiSave className="w-4 h-4" />}
      Save Changes
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-primary">Settings</h2>
        <p className="font-body text-sm text-gray-400">Manage your store configuration</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-luxe p-1 flex flex-wrap gap-1">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-body text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Store Info ── */}
      {activeTab === 'Store Info' && settings && (
        <Section title="Store Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Store Name</label>
              <input className={INPUT} value={settings.storeName || ''} onChange={(e) => set('storeName', e.target.value)} />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Tagline</label>
              <input className={INPUT} value={settings.tagline || ''} onChange={(e) => set('tagline', e.target.value)} />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
              <input type="email" className={INPUT} value={settings.contactEmail || ''} onChange={(e) => set('contactEmail', e.target.value)} />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input className={INPUT} value={settings.phone || ''} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Address</label>
              <input className={INPUT} value={settings.address?.street || ''} onChange={(e) => set('address.street', e.target.value)} placeholder="Street address" />
              <div className="grid grid-cols-3 gap-2 mt-2">
                <input className={INPUT} value={settings.address?.city || ''} onChange={(e) => set('address.city', e.target.value)} placeholder="City" />
                <input className={INPUT} value={settings.address?.state || ''} onChange={(e) => set('address.state', e.target.value)} placeholder="State" />
                <input className={INPUT} value={settings.address?.country || ''} onChange={(e) => set('address.country', e.target.value)} placeholder="Country" />
              </div>
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Logo URL</label>
              <input className={INPUT} value={settings.logo?.url || ''} onChange={(e) => set('logo.url', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Favicon URL</label>
              <input className={INPUT} value={settings.favicon?.url || ''} onChange={(e) => set('favicon.url', e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <SaveBtn onClick={saveSettings} loading={saving} />
        </Section>
      )}

      {/* ── Shipping ── */}
      {activeTab === 'Shipping' && settings && (
        <Section title="Shipping Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number" min="0"
                className={INPUT}
                value={settings.shipping?.freeShippingThreshold ?? ''}
                onChange={(e) => set('shipping.freeShippingThreshold', Number(e.target.value))}
                placeholder="999"
              />
              <p className="font-body text-xs text-gray-400 mt-1">Set 0 to disable free shipping</p>
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">
                Flat Shipping Rate ($)
              </label>
              <input
                type="number" min="0"
                className={INPUT}
                value={settings.shipping?.flatShippingRate ?? ''}
                onChange={(e) => set('shipping.flatShippingRate', Number(e.target.value))}
                placeholder="120"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Currency Code</label>
              <input className={INPUT} value={settings.currency?.code || 'USD'}
                onChange={(e) => set('currency.code', e.target.value)} placeholder="USD" />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Currency Symbol</label>
              <input className={INPUT} value={settings.currency?.symbol || '$'}
                onChange={(e) => set('currency.symbol', e.target.value)} placeholder="$" />
            </div>
          </div>

          <div className="bg-accent/20 rounded-xl p-4">
            <p className="font-body text-sm text-primary font-semibold mb-1">Current Shipping Rules</p>
            <p className="font-body text-sm text-gray-600">
              Orders under ${settings.shipping?.freeShippingThreshold || 0} → ${settings.shipping?.flatShippingRate || 0} shipping fee
            </p>
            <p className="font-body text-sm text-gray-600">
              Orders ${settings.shipping?.freeShippingThreshold || 0}+ → FREE shipping
            </p>
          </div>

          <SaveBtn onClick={saveSettings} loading={saving} />
        </Section>
      )}

      {/* ── Social Links ── */}
      {activeTab === 'Social Links' && settings && (
        <Section title="Social Media Links">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['facebook', 'instagram', 'twitter', 'youtube', 'pinterest', 'tiktok'].map((platform) => (
              <div key={platform}>
                <label className="block font-body text-sm font-semibold text-gray-700 mb-1 capitalize">{platform}</label>
                <input
                  className={INPUT}
                  value={settings.socialLinks?.[platform] || ''}
                  onChange={(e) => set(`socialLinks.${platform}`, e.target.value)}
                  placeholder={`https://${platform}.com/...`}
                />
              </div>
            ))}
          </div>
          <SaveBtn onClick={saveSettings} loading={saving} />
        </Section>
      )}

      {/* ── Admin Account ── */}
      {activeTab === 'Admin Account' && (
        <Section title="Change Password">
          <div className="max-w-md space-y-4">
            <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-xl mb-2">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-heading font-bold text-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-primary">{user?.name}</p>
                <p className="font-body text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password' },
              { key: 'confirmNewPassword', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block font-body text-sm font-semibold text-gray-700 mb-1">{label}</label>
                <input
                  type="password" className={INPUT}
                  value={pwForm[key]} onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
            ))}
            <button onClick={changePassword} disabled={pwSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-body text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
              {pwSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiLockClosed className="w-4 h-4" />}
              Change Password
            </button>
          </div>
        </Section>
      )}

      {/* ── Add Admin ── */}
      {activeTab === 'Add Admin' && (
        <Section title="Add New Admin">
          <div className="max-w-md space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="font-body text-sm text-yellow-700">
                ⚠️ Admin accounts have full access to the admin panel. Only add trusted users.
              </p>
            </div>
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Admin Name' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'admin@luxefashion.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block font-body text-sm font-semibold text-gray-700 mb-1">{label}</label>
                <input
                  type={type} className={INPUT}
                  value={adminForm[key]} onChange={(e) => setAdminForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <button onClick={addAdmin} disabled={adminSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white rounded-xl font-body text-sm font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-60">
              {adminSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiUserAdd className="w-4 h-4" />}
              Create Admin Account
            </button>
          </div>
        </Section>
      )}
    </div>
  );
};

export default AdminSettings;