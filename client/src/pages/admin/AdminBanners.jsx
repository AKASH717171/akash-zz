import React, { useState, useEffect, useCallback } from 'react';
import {
  HiPlus, HiTrash, HiPencil, HiPhotograph, HiEye, HiEyeOff,
  HiX, HiCheck, HiRefresh, HiChevronUp, HiChevronDown,
} from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BANNER_TYPES = ['hero', 'promo', 'category', 'popup', 'sidebar'];
const TEXT_POSITIONS = ['left', 'center', 'right'];

const defaultForm = {
  image: { url: '', publicId: '' },
  title: '',
  subtitle: '',
  ctaText: 'Shop Now',
  ctaLink: '/shop',
  secondaryCtaText: '',
  secondaryCtaLink: '',
  textColor: '#FFFFFF',
  overlayColor: 'rgba(0,0,0,0.3)',
  textPosition: 'center',
  order: 1,
  type: 'hero',
  active: true,
  startDate: '',
  endDate: '',
};

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [filterType, setFilterType] = useState('all');
  const [filterActive, setFilterActive] = useState('');

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterActive !== '') params.append('active', filterActive);

      const { data } = await api.get(`/banners/admin/all?${params}`);
      if (data.success) setBanners(data.banners || []);
    } catch (err) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterActive]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const openCreate = () => {
    setEditingBanner(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (banner) => {
    setEditingBanner(banner);
    setForm({
      image: banner.image || { url: '', publicId: '' },
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      ctaText: banner.ctaText || 'Shop Now',
      ctaLink: banner.ctaLink || '/shop',
      secondaryCtaText: banner.secondaryCtaText || '',
      secondaryCtaLink: banner.secondaryCtaLink || '',
      textColor: banner.textColor || '#FFFFFF',
      overlayColor: banner.overlayColor || 'rgba(0,0,0,0.3)',
      textPosition: banner.textPosition || 'center',
      order: banner.order || 1,
      type: banner.type || 'hero',
      active: banner.active !== undefined ? banner.active : true,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    if (name === 'imageUrl') {
      setForm(prev => ({ ...prev, image: { ...prev.image, url: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: inputType === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image?.url) {
      toast.error('Banner image URL is required');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      if (editingBanner) {
        const { data } = await api.put(`/banners/${editingBanner._id}`, payload);
        if (data.success) {
          toast.success('Banner updated!');
          setShowModal(false);
          fetchBanners();
        }
      } else {
        const { data } = await api.post('/banners', payload);
        if (data.success) {
          toast.success('Banner created!');
          setShowModal(false);
          fetchBanners();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`"${title || 'This banner'}" Delete this banner?`)) return;
    try {
      const { data } = await api.delete(`/banners/${id}`);
      if (data.success) {
        toast.success('Banner deleted!');
        fetchBanners();
      }
    } catch (err) {
      toast.error('Failed to delete banner');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const { data } = await api.put(`/banners/${banner._id}`, { active: !banner.active });
      if (data.success) {
        toast.success(banner.active ? 'Banner deactivated' : 'Banner activated');
        fetchBanners();
      }
    } catch (err) {
      toast.error('Failed to update banner');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">Banners</h1>
          <p className="font-body text-sm text-gray-500 mt-1">Manage hero slides and promotional banners</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-body font-semibold text-sm hover:bg-secondary/90 transition-colors shadow-lg"
        >
          <HiPlus className="w-4 h-4" />
          New Banner
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:border-secondary"
        >
          <option value="all">All Types</option>
          {BANNER_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <select
          value={filterActive}
          onChange={e => setFilterActive(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:border-secondary"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button onClick={fetchBanners} className="p-2 text-gray-500 hover:text-secondary transition-colors">
          <HiRefresh className="w-4 h-4" />
        </button>
        <span className="ml-auto text-sm text-gray-400 font-body">{banners.length} banners</span>
      </div>

      {/* Banner List */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-body text-sm">Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <HiPhotograph className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-heading text-lg font-semibold text-gray-400">No banners found</p>
          <p className="font-body text-sm text-gray-400 mt-1">Click "New Banner" to create your first banner</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {banner.image?.url ? (
                  <img src={banner.image.url} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiPhotograph className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-body font-semibold ${
                    banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {banner.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-body bg-secondary/10 text-secondary font-semibold">
                    {banner.type}
                  </span>
                  <span className="text-xs text-gray-400 font-body">Order: {banner.order}</span>
                </div>
                <p className="font-body font-semibold text-primary text-sm truncate">
                  {banner.title || '(No title)'}
                </p>
                {banner.subtitle && (
                  <p className="font-body text-xs text-gray-500 truncate">{banner.subtitle}</p>
                )}
                <p className="font-body text-xs text-gray-400 mt-0.5">
                  CTA: <span className="text-secondary">{banner.ctaText}</span> → {banner.ctaLink}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`p-2 rounded-lg transition-colors ${
                    banner.active
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={banner.active ? 'Deactivate' : 'Activate'}
                >
                  {banner.active ? <HiEye className="w-4 h-4" /> : <HiEyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEdit(banner)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <HiPencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner._id, banner.title)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-heading text-xl font-bold text-primary">
                {editingBanner ? 'Edit Banner' : 'New Banner'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <HiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image URL */}
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={form.image?.url || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                  required
                />
                {form.image?.url && (
                  <img src={form.image.url} alt="preview" className="mt-2 h-24 rounded-xl object-cover w-full" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                  >
                    {BANNER_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>

                {/* Text Position */}
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">Text Position</label>
                  <select
                    name="textPosition"
                    value={form.textPosition}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                  >
                    {TEXT_POSITIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Banner title"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                />
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  placeholder="Banner subtitle"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">CTA Button Text</label>
                  <input
                    type="text"
                    name="ctaText"
                    value={form.ctaText}
                    onChange={handleChange}
                    placeholder="Shop Now"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">CTA Link</label>
                  <input
                    type="text"
                    name="ctaLink"
                    value={form.ctaLink}
                    onChange={handleChange}
                    placeholder="/shop"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              {/* Secondary CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">Secondary CTA Text</label>
                  <input
                    type="text"
                    name="secondaryCtaText"
                    value={form.secondaryCtaText}
                    onChange={handleChange}
                    placeholder="View All (optional)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">Secondary CTA Link</label>
                  <input
                    type="text"
                    name="secondaryCtaLink"
                    value={form.secondaryCtaLink}
                    onChange={handleChange}
                    placeholder="/shop?featured=true"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="textColor"
                      value={form.textColor}
                      onChange={handleChange}
                      className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      name="textColor"
                      value={form.textColor}
                      onChange={handleChange}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={form.order}
                    onChange={handleChange}
                    min="1"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">Start Date (optional)</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">End Date (optional)</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="w-4 h-4 accent-secondary"
                />
                <label htmlFor="active" className="font-body text-sm font-semibold text-primary cursor-pointer">
                  Banner Active (visible on site)
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-body font-semibold text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-secondary text-white rounded-xl font-body font-semibold text-sm hover:bg-secondary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <HiCheck className="w-4 h-4" />
                  )}
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;