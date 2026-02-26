import React, { useState, useEffect, useCallback } from 'react';
import {
  HiPlus, HiPencil, HiTrash, HiX, HiSave,
  HiPhotograph, HiChevronUp, HiChevronDown, HiEyeOff, HiEye,
} from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TABS = ['Banners', 'Announcement', 'FAQ'];

const INPUT = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20';

// ══════════════════════════════════════════
// Banners Section
// ══════════════════════════════════════════
const BannersSection = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBanner, setEditBanner] = useState(null); // null=list, obj=editing
  const [saving, setSaving] = useState(false);

  const EMPTY_BANNER = { title: '', subtitle: '', ctaText: 'Shop Now', ctaLink: '/shop', active: true, image: '' };

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/banners/admin/all');
      if (data.success) setBanners(data.banners || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const saveBanner = async () => {
    if (!editBanner.title) return toast.error('Title required');
    setSaving(true);
    try {
      if (editBanner._id) {
        await api.put(`/banners/${editBanner._id}`, editBanner);
        toast.success('Banner updated!');
      } else {
        await api.post('/banners', editBanner);
        toast.success('Banner created!');
      }
      setEditBanner(null);
      fetchBanners();
    } catch { toast.error('Failed to save banner'); }
    finally { setSaving(false); }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (banner) => {
    try {
      await api.put(`/banners/${banner._id}`, { ...banner, active: !banner.active });
      setBanners((prev) => prev.map((b) => b._id === banner._id ? { ...b, active: !b.active } : b));
    } catch { toast.error('Update failed'); }
  };

  const reorder = async (id, dir) => {
    const idx = banners.findIndex((b) => b._id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === banners.length - 1) return;
    const newBanners = [...banners];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    [newBanners[idx], newBanners[swapIdx]] = [newBanners[swapIdx], newBanners[idx]];
    setBanners(newBanners);
    try {
      await api.put('/banners/reorder', { ids: newBanners.map((b) => b._id) });
    } catch {}
  };

  if (editBanner !== null) {
    return (
      <div className="bg-white rounded-2xl shadow-luxe p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-primary">
            {editBanner._id ? 'Edit Banner' : 'New Banner'}
          </h3>
          <button onClick={() => setEditBanner(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Banner Image URL</label>
            <input className={INPUT} value={editBanner.image || ''} onChange={(e) => setEditBanner((b) => ({ ...b, image: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input className={INPUT} value={editBanner.title || ''} onChange={(e) => setEditBanner((b) => ({ ...b, title: e.target.value }))} placeholder="GRAND OPENING SALE" />
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
            <input className={INPUT} value={editBanner.subtitle || ''} onChange={(e) => setEditBanner((b) => ({ ...b, subtitle: e.target.value }))} placeholder="UP TO 80% OFF" />
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-gray-700 mb-1">CTA Button Text</label>
            <input className={INPUT} value={editBanner.ctaText || ''} onChange={(e) => setEditBanner((b) => ({ ...b, ctaText: e.target.value }))} placeholder="Shop Now" />
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-gray-700 mb-1">CTA Link</label>
            <input className={INPUT} value={editBanner.ctaLink || ''} onChange={(e) => setEditBanner((b) => ({ ...b, ctaLink: e.target.value }))} placeholder="/shop" />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <label className="font-body text-sm font-semibold text-gray-700">Status:</label>
            <button
              type="button"
              onClick={() => setEditBanner((b) => ({ ...b, active: !b.active }))}
              className={`px-4 py-1.5 rounded-xl font-body text-sm font-semibold transition-colors ${editBanner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {editBanner.active ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
        {editBanner.image && (
          <div className="rounded-xl overflow-hidden border border-gray-100 max-h-40 bg-gray-50">
            <img src={editBanner.image} alt="preview" className="w-full h-full object-cover max-h-40" onError={(e) => e.target.style.display = 'none'} />
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => setEditBanner(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-body text-sm font-semibold text-gray-600">Cancel</button>
          <button onClick={saveBanner} disabled={saving}
            className="flex-1 py-2.5 bg-secondary text-white rounded-xl font-body text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <HiSave className="w-4 h-4" /> Save Banner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-gray-400">{banners.length} banners</p>
        <button onClick={() => setEditBanner(EMPTY_BANNER)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl font-body text-sm font-semibold hover:bg-secondary/90 transition-colors">
          <HiPlus className="w-4 h-4" /> Add Banner
        </button>
      </div>
      {loading ? (
        <div className="bg-white rounded-2xl shadow-luxe p-8 text-center">
          <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto" />
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-luxe p-12 text-center">
          <HiPhotograph className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-body text-gray-400">No banners yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b, idx) => (
            <div key={b._id} className="bg-white rounded-2xl shadow-luxe p-4 flex items-center gap-4">
              <div className="w-20 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                {b.image ? (
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiPhotograph className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-bold text-primary truncate">{b.title}</h4>
                  <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${b.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {b.active ? 'Active' : 'Off'}
                  </span>
                </div>
                <p className="font-body text-xs text-gray-400 truncate">{b.subtitle}</p>
                <p className="font-body text-xs text-gray-300">{b.ctaText} → {b.ctaLink}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => reorder(b._id, 'up')} disabled={idx === 0}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30"><HiChevronUp className="w-4 h-4" /></button>
                <button onClick={() => reorder(b._id, 'down')} disabled={idx === banners.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30"><HiChevronDown className="w-4 h-4" /></button>
                <button onClick={() => toggleActive(b)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                  {b.active ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditBanner({ ...b })} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500">
                  <HiPencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteBanner(b._id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400">
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════
// FAQ Section
// ══════════════════════════════════════════
const FAQSection = () => {
  const [faqs, setFaqs] = useState([
    { id: 1, category: 'Orders', question: 'How do I track my order?', answer: 'You can track your order from My Account → Orders section.' },
    { id: 2, category: 'Shipping', question: 'How long does shipping take?', answer: 'Standard shipping takes 3-7 business days.' },
    { id: 3, category: 'Returns', question: 'What is your return policy?', answer: 'We accept returns within 30 days of delivery.' },
    { id: 4, category: 'Coupons', question: 'How do I get the 80% OFF coupon?', answer: 'Chat with us on live chat to receive your exclusive coupon code!' },
  ]);
  const [editing, setEditing] = useState(null);
  const [newFaq, setNewFaq] = useState({ category: 'Orders', question: '', answer: '' });
  const [adding, setAdding] = useState(false);

  const CATEGORIES = ['Orders', 'Shipping', 'Returns', 'Payment', 'Coupons', 'Products'];

  const save = () => {
    if (!editing.question || !editing.answer) return toast.error('Question and answer required');
    setFaqs((prev) => prev.map((f) => f.id === editing.id ? editing : f));
    setEditing(null);
    toast.success('FAQ updated!');
  };

  const addFaq = () => {
    if (!newFaq.question || !newFaq.answer) return toast.error('Fill all fields');
    setFaqs((prev) => [...prev, { ...newFaq, id: Date.now() }]);
    setNewFaq({ category: 'Orders', question: '', answer: '' });
    setAdding(false);
    toast.success('FAQ added!');
  };

  const deleteFaq = (id) => { setFaqs((prev) => prev.filter((f) => f.id !== id)); toast.success('FAQ deleted'); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-gray-400">{faqs.length} FAQs</p>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl font-body text-sm font-semibold hover:bg-secondary/90 transition-colors">
          <HiPlus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-2xl shadow-luxe p-5 space-y-3 border border-secondary/20">
          <h4 className="font-heading font-bold text-primary">New FAQ</h4>
          <div className="grid grid-cols-2 gap-3">
            <select className={INPUT} value={newFaq.category} onChange={(e) => setNewFaq((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className={INPUT} value={newFaq.question} onChange={(e) => setNewFaq((f) => ({ ...f, question: e.target.value }))} placeholder="Question..." />
          </div>
          <textarea rows={3} className={`${INPUT} resize-none`} value={newFaq.answer} onChange={(e) => setNewFaq((f) => ({ ...f, answer: e.target.value }))} placeholder="Answer..." />
          <div className="flex gap-3">
            <button onClick={() => setAdding(false)} className="flex-1 py-2 border border-gray-200 rounded-xl font-body text-sm text-gray-600">Cancel</button>
            <button onClick={addFaq} className="flex-1 py-2 bg-secondary text-white rounded-xl font-body text-sm font-semibold">Add FAQ</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-2xl shadow-luxe p-4">
            {editing?.id === faq.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <select className={INPUT} value={editing.category} onChange={(e) => setEditing((f) => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input className={INPUT} value={editing.question} onChange={(e) => setEditing((f) => ({ ...f, question: e.target.value }))} />
                </div>
                <textarea rows={3} className={`${INPUT} resize-none`} value={editing.answer} onChange={(e) => setEditing((f) => ({ ...f, answer: e.target.value }))} />
                <div className="flex gap-2">
                  <button onClick={() => setEditing(null)} className="flex-1 py-2 border border-gray-200 rounded-xl font-body text-sm text-gray-600">Cancel</button>
                  <button onClick={save} className="flex-1 py-2 bg-secondary text-white rounded-xl font-body text-sm font-semibold">Save</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-body font-semibold px-2 py-0.5 bg-accent/40 text-primary rounded-lg">{faq.category}</span>
                  </div>
                  <p className="font-body text-sm font-semibold text-primary">{faq.question}</p>
                  <p className="font-body text-sm text-gray-500 mt-1">{faq.answer}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditing({ ...faq })} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500">
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteFaq(faq.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════
// Announcement Section
// ══════════════════════════════════════════
const AnnouncementSection = () => {
  const [text, setText] = useState('🚚 FREE SHIPPING on orders over $50 | 💬 Chat with us for EXCLUSIVE 80% OFF Coupon! | 🔄 Easy 30-Day Returns');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { announcementText: text });
      toast.success('Announcement updated!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-luxe p-6 space-y-4">
      <div>
        <h4 className="font-heading font-bold text-primary mb-1">Announcement Bar Text</h4>
        <p className="font-body text-xs text-gray-400">This text scrolls across the top of your website</p>
      </div>
      <div className="bg-primary rounded-xl px-4 py-2 text-center">
        <p className="font-body text-sm text-white/90 truncate">{text}</p>
      </div>
      <textarea
        rows={3}
        className={`${INPUT} resize-none`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Announcement text..."
      />
      <div className="text-xs font-body text-gray-400">
        Tip: Use emojis and | to separate messages. E.g.: 🚚 FREE SHIPPING | 💬 Chat for 80% OFF
      </div>
      <button onClick={save} disabled={saving}
        className="px-6 py-2.5 bg-secondary text-white rounded-xl font-body text-sm font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
        {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        <HiSave className="w-4 h-4" /> Save
      </button>
    </div>
  );
};

// ══════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════
const AdminPages = () => {
  const [activeTab, setActiveTab] = useState('Banners');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-2xl font-bold text-primary">Pages & Content</h2>
        <p className="font-body text-sm text-gray-400">Manage banners, announcements, and FAQs</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-luxe p-1 flex gap-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl font-body text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Banners' && <BannersSection />}
      {activeTab === 'Announcement' && <AnnouncementSection />}
      {activeTab === 'FAQ' && <FAQSection />}
    </div>
  );
};

export default AdminPages;