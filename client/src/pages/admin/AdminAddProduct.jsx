import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiX, HiPhotograph, HiStar } from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const slugify = (text) =>
  text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const COLOR_OPTIONS = [
  { name: 'Black', hex: '#111111' }, { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#E74C3C' }, { name: 'Navy', hex: '#1A1A2E' },
  { name: 'Gold', hex: '#C4A35A' }, { name: 'Pink', hex: '#F48FB1' },
  { name: 'Blue', hex: '#3498DB' }, { name: 'Green', hex: '#27AE60' },
  { name: 'Beige', hex: '#E8D5B7' }, { name: 'Brown', hex: '#795548' },
];

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-luxe p-6">
    <h3 className="font-heading text-base font-bold text-primary mb-5 pb-3 border-b border-gray-100">
      {title}
    </h3>
    {children}
  </div>
);

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    title: '', slug: '', shortDesc: '', longDesc: '',
    category: '', subCategory: '',
    regularPrice: '', salePrice: '',
    stock: '', sku: '',
    sizes: [], colors: [],
    tags: [],
    featured: false, newArrival: false,
    status: 'active',
    metaTitle: '', metaDescription: '',
  });

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      if (data.success) setCategories(data.categories || []);
    });
  }, []);

  useEffect(() => {
    if (form.category) {
      const cat = categories.find(c => c._id === form.category);
      setSubCategories(cat?.children || []);
      setForm(prev => ({ ...prev, subCategory: '' }));
    }
  }, [form.category, categories]);

  const discountPercent = form.regularPrice && form.salePrice
    ? Math.round(((Number(form.regularPrice) - Number(form.salePrice)) / Number(form.regularPrice)) * 100)
    : 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' ? { slug: slugify(value) } : {}),
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSizeToggle = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleColorToggle = (color) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !form.tags.includes(tag)) {
        setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data.success && data.image) {
          setImages(prev => [...prev, { url: data.image.url, publicId: data.image.publicId || '', isMain: prev.length === 0 }]);
        }
      }
      toast.success('Images uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSetMain = (index) => {
    setImages(prev => prev.map((img, i) => ({ ...img, isMain: i === index })));
  };

  const handleRemoveImage = (index) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some(img => img.isMain)) {
        updated[0].isMain = true;
      }
      return updated;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.regularPrice) e.regularPrice = 'Regular price is required';
    if (!form.stock && form.stock !== 0) e.stock = 'Stock is required';
    if (images.length === 0) e.images = 'At least one image is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (statusOverride) => {
    if (!validate()) { toast.error('Please fix the errors'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        descriptions: { short: form.shortDesc, long: form.longDesc },
        category: form.category,
        subCategory: form.subCategory,
        regularPrice: Number(form.regularPrice),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        discountPercent: discountPercent || undefined,
        stock: Number(form.stock),
        sku: form.sku,
        sizes: form.sizes.map(s => typeof s === 'string' ? { name: s, stock: Number(form.stock) || 0 } : s),
        colors: form.colors.map(c => typeof c === 'string' ? { name: c, code: '' } : c),
        tags: form.tags,
        images,
        featured: form.featured,
        newArrival: form.newArrival,
        status: statusOverride || form.status,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
      };
      const { data } = await api.post('/products', payload);
      if (data.success) {
        toast.success('Product created successfully!');
        navigate('/admin/products');
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary">Add New Product</h2>
          <p className="font-body text-sm text-gray-400">Fill in the product details below</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="px-5 py-2.5 border border-gray-200 rounded-xl font-body font-semibold text-sm
                       text-gray-600 hover:border-secondary hover:text-secondary transition-colors disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('active')}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl
                       font-body font-semibold text-sm hover:bg-secondary transition-colors
                       disabled:opacity-60 shadow-luxe"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>✅ Publish</>
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <Section title="Basic Information">
            <div className="space-y-4">
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">
                  Product Title <span className="text-sale">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Elegant Floral Maxi Dress"
                  className={`w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none transition-colors
                             ${errors.title ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`}
                />
                {errors.title && <p className="font-body text-xs text-sale mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Slug</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-secondary transition-colors">
                  <span className="px-3 py-3 bg-gray-50 border-r border-gray-200 font-body text-xs text-gray-400">
                    /product/
                  </span>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    className="flex-1 px-3 py-3 font-body text-sm focus:outline-none"
                    placeholder="auto-generated-from-title"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Short Description</label>
                <textarea
                  name="shortDesc"
                  value={form.shortDesc}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Brief product description (shown in listings)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                             focus:outline-none focus:border-secondary transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Full Description</label>
                <textarea
                  name="longDesc"
                  value={form.longDesc}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Detailed product description, features, materials..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                             focus:outline-none focus:border-secondary transition-colors resize-none"
                />
              </div>
            </div>
          </Section>

          {/* Images */}
          <Section title="Product Images">
            <div className="space-y-4">
              {/* Upload Area */}
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8
                               cursor-pointer transition-colors ${
                errors.images
                  ? 'border-sale/50 bg-sale/5 hover:bg-sale/10'
                  : 'border-gray-200 hover:border-secondary/50 hover:bg-secondary/5'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading || images.length >= 6}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                    <p className="font-body text-sm text-gray-400">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <HiPhotograph className="w-10 h-10 text-gray-300" />
                    <p className="font-body text-sm font-semibold text-gray-500">
                      {images.length >= 6 ? 'Maximum 6 images reached' : 'Click to upload images'}
                    </p>
                    <p className="font-body text-xs text-gray-400">PNG, JPG up to 5MB each · Max 6 images</p>
                  </div>
                )}
              </label>
              {errors.images && <p className="font-body text-xs text-sale">{errors.images}</p>}

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      img.isMain ? 'border-secondary shadow-gold' : 'border-transparent hover:border-gray-300'
                    }`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      {img.isMain && (
                        <div className="absolute top-1 left-1 bg-secondary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          Main
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center gap-1 opacity-0 hover:opacity-100">
                        {!img.isMain && (
                          <button
                            onClick={() => handleSetMain(i)}
                            className="w-7 h-7 bg-secondary text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                            title="Set as main"
                          >
                            ★
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveImage(i)}
                          className="w-7 h-7 bg-sale text-white rounded-full flex items-center justify-center"
                        >
                          <HiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Variants */}
          <Section title="Variants">
            <div className="space-y-5">
              {/* Sizes */}
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-2">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-4 py-2 rounded-xl border text-sm font-body font-semibold transition-all ${
                        form.sizes.includes(size)
                          ? 'bg-primary text-white border-primary shadow-luxe'
                          : 'border-gray-200 text-gray-600 hover:border-secondary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-2">Colors</label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map(({ name, hex }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleColorToggle(name.toLowerCase())}
                      title={name}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                        form.colors.includes(name.toLowerCase())
                          ? 'border-secondary scale-110 shadow-gold'
                          : 'border-transparent hover:scale-105 hover:border-gray-300'
                      } ${name === 'White' ? 'ring-1 ring-gray-200' : ''}`}
                      style={{ backgroundColor: hex }}
                    >
                      {form.colors.includes(name.toLowerCase()) && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs">
                          {name === 'White' ? '✓' : <span className="text-white">✓</span>}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {form.colors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.colors.map(c => (
                      <span key={c} className="font-body text-xs bg-primary/5 text-primary px-2.5 py-1 rounded-full capitalize flex items-center gap-1">
                        {c}
                        <button onClick={() => handleColorToggle(c)} className="hover:text-sale">
                          <HiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* SEO */}
          <Section title="SEO Settings">
            <div className="space-y-4">
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Meta Title</label>
                <input
                  name="metaTitle"
                  value={form.metaTitle}
                  onChange={handleChange}
                  placeholder="SEO-friendly title (optional)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                             focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Meta Description</label>
                <textarea
                  name="metaDescription"
                  value={form.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="SEO description (optional)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                             focus:outline-none focus:border-secondary transition-colors resize-none"
                />
              </div>
            </div>
          </Section>
        </div>

        {/* Right Column */}
        <div className="space-y-5">

          {/* Status */}
          <Section title="Status & Visibility">
            <div className="space-y-4">
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                             focus:outline-none focus:border-secondary bg-white"
                >
                  <option value="active">Active (Published)</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'featured', label: '⭐ Featured Product', sub: 'Show on homepage featured section' },
                  { name: 'newArrival', label: '🆕 New Arrival', sub: 'Show in new arrivals section' },
                ].map(({ name, label, sub }) => (
                  <label key={name} className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      name={name}
                      checked={form[name]}
                      onChange={handleChange}
                      className="w-4 h-4 accent-secondary mt-0.5"
                    />
                    <div>
                      <p className="font-body text-sm font-semibold text-primary">{label}</p>
                      <p className="font-body text-xs text-gray-400">{sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          {/* Category */}
          <Section title="Category">
            <div className="space-y-3">
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">
                  Category <span className="text-sale">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none
                             transition-colors bg-white ${errors.category ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="font-body text-xs text-sale mt-1">{errors.category}</p>}
              </div>
              {subCategories.length > 0 && (
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">Sub-Category</label>
                  <select
                    name="subCategory"
                    value={form.subCategory}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                               focus:outline-none focus:border-secondary bg-white"
                  >
                    <option value="">Select sub-category</option>
                    {subCategories.map(sub => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div className="space-y-3">
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">
                  Regular Price ($) <span className="text-sale">*</span>
                </label>
                <input
                  type="number"
                  name="regularPrice"
                  value={form.regularPrice}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={`w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none transition-colors
                             ${errors.regularPrice ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`}
                />
                {errors.regularPrice && <p className="font-body text-xs text-sale mt-1">{errors.regularPrice}</p>}
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Sale Price ($)</label>
                <input
                  type="number"
                  name="salePrice"
                  value={form.salePrice}
                  onChange={handleChange}
                  placeholder="Leave empty for no sale"
                  min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                             focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
              {discountPercent > 0 && (
                <div className="bg-sale/10 border border-sale/20 rounded-xl px-3 py-2.5 text-center">
                  <p className="font-body text-sm font-bold text-sale">
                    🏷️ {discountPercent}% Discount Applied!
                  </p>
                  <p className="font-body text-xs text-sale/70">
                    Saving ${(Number(form.regularPrice) - Number(form.salePrice)).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* Stock & SKU */}
          <Section title="Inventory">
            <div className="space-y-3">
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">
                  Stock Quantity <span className="text-sale">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={`w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none transition-colors
                             ${errors.stock ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`}
                />
                {errors.stock && <p className="font-body text-xs text-sale mt-1">{errors.stock}</p>}
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">SKU</label>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. LF-DRESS-001"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                             focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>
          </Section>

          {/* Tags */}
          <Section title="Tags">
            <div>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                           focus:outline-none focus:border-secondary transition-colors"
              />
              <p className="font-body text-xs text-gray-400 mt-1.5">Press Enter or comma to add</p>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {form.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-primary/5 text-primary text-xs
                                             font-body font-medium px-2.5 py-1.5 rounded-full">
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-sale">
                        <HiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-3 py-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="px-6 py-3 border border-gray-200 rounded-xl font-body font-semibold text-sm
                     text-gray-600 hover:border-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmit('draft')}
          disabled={saving}
          className="px-6 py-3 border border-gray-200 rounded-xl font-body font-semibold text-sm
                     text-gray-600 hover:border-secondary hover:text-secondary transition-colors disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSubmit('active')}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-body
                     font-semibold text-sm hover:bg-secondary transition-colors disabled:opacity-60 shadow-luxe"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : '✅ Publish Product'}
        </button>
      </div>
    </div>
  );
};

export default AdminAddProduct;