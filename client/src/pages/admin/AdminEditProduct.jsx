import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import AdminAddProduct from './AdminAddProduct';

// AdminEditProduct wraps the same form logic but pre-fills data
// We use a HOC pattern — fetch product, then render the full form

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/admin/${id}`)
      .then(({ data }) => {
        if (data.success) setProduct(data.product);
        else { toast.error('Product not found'); navigate('/admin/products'); }
      })
      .catch(() => { toast.error('Failed to load product'); navigate('/admin/products'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-8 w-64 rounded-xl" />
        <div className="bg-white rounded-2xl shadow-luxe p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Render the same form with pre-filled data
  return <AdminAddProductForm product={product} isEdit />;
};

// Reusable form with edit support (extracted inline here)
const AdminAddProductForm = ({ product, isEdit }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const COLOR_OPTIONS = [
    { name: 'Black', hex: '#111111' }, { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#E74C3C' }, { name: 'Navy', hex: '#1A1A2E' },
    { name: 'Gold', hex: '#C4A35A' }, { name: 'Pink', hex: '#F48FB1' },
    { name: 'Blue', hex: '#3498DB' }, { name: 'Green', hex: '#27AE60' },
    { name: 'Beige', hex: '#E8D5B7' }, { name: 'Brown', hex: '#795548' },
  ];

  const slugify = (text) =>
    text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

  const [form, setForm] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    shortDesc: product?.descriptions?.short || product?.shortDescription || '',
    longDesc: product?.descriptions?.long || product?.description || '',
    category: product?.category?._id || product?.category || '',
    subCategory: product?.subCategory?._id || product?.subCategory || '',
    regularPrice: product?.regularPrice || '',
    salePrice: product?.salePrice || '',
    stock: product?.stock ?? '',
    sku: product?.sku || '',
    sizes: (product?.sizes || []).map(s => typeof s === 'object' ? s.name : s),
    colors: (product?.colors || []).map(c => typeof c === 'object' ? c.name.toLowerCase() : c),
    tags: product?.tags || [],
    featured: product?.featured || false,
    newArrival: product?.newArrival || false,
    status: product?.status || 'active',
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
  });

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      if (data.success) setCategories(data.categories || []);
    });
  }, []);

  useEffect(() => {
    if (form.category && categories.length > 0) {
      const cat = categories.find(c => c._id === form.category);
      setSubCategories(cat?.children || []);
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
    const sizeStr = typeof size === 'object' ? size.name : size;
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.map(s => typeof s === 'object' ? s.name : s).includes(sizeStr)
        ? prev.sizes.filter(s => (typeof s === 'object' ? s.name : s) !== sizeStr)
        : [...prev.sizes, sizeStr],
    }));
  };

  const handleColorToggle = (color) => {
    const colorStr = (typeof color === 'object' ? color.name : color).toLowerCase();
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map(c => typeof c === 'object' ? c.name.toLowerCase() : c).includes(colorStr)
        ? prev.colors.filter(c => (typeof c === 'object' ? c.name.toLowerCase() : c) !== colorStr)
        : [...prev.colors, colorStr],
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > 6) { toast.error('Max 6 images'); return; }
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data.success && (data.image || data.url)) {
          setImages(prev => [...prev, { url: data.image?.url || data.url, publicId: data.image?.publicId || data.publicId || '', isMain: prev.length === 0 }]);
        }
      }
      toast.success('Images uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSetMain = (i) => setImages(prev => prev.map((img, idx) => ({ ...img, isMain: idx === i })));
  const handleRemoveImage = (i) => {
    setImages(prev => {
      const updated = prev.filter((_, idx) => idx !== i);
      if (updated.length > 0 && !updated.some(x => x.isMain)) updated[0].isMain = true;
      return updated;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.regularPrice) e.regularPrice = 'Required';
    if (form.stock === '' || form.stock === undefined) e.stock = 'Required';
    if (images.length === 0) e.images = 'At least one image required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (statusOverride) => {
    if (!validate()) { toast.error('Please fix the errors'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title, slug: form.slug,
        descriptions: { short: form.shortDesc, long: form.longDesc },
        category: form.category, subCategory: form.subCategory || undefined,
        regularPrice: Number(form.regularPrice),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        discountPercent: discountPercent || undefined,
        stock: Number(form.stock), sku: form.sku,
        sizes: form.sizes.map(s => typeof s === 'string' ? { name: s, stock: 0 } : s),
        colors: form.colors.map(c => typeof c === 'string' ? { name: c, code: '' } : c),
        tags: form.tags, images,
        featured: form.featured, newArrival: form.newArrival,
        status: statusOverride || form.status,
        metaTitle: form.metaTitle, metaDescription: form.metaDescription,
      };

      const { data } = isEdit
        ? await api.put(`/products/${product._id}`, payload)
        : await api.post('/products', payload);

      if (data.success) {
        toast.success(`Product ${isEdit ? 'updated' : 'created'}!`);
        navigate('/admin/products');
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          {isEdit && (
            <p className="font-body text-sm text-gray-400">Editing: {product.title}</p>
          )}
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
            onClick={() => handleSubmit(form.status)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-body
                       font-semibold text-sm hover:bg-secondary transition-colors disabled:opacity-60 shadow-luxe"
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : isEdit ? '✅ Update Product' : '✅ Publish'}
          </button>
        </div>
      </div>

      {/* Reuse same form layout — identical to AdminAddProduct fields */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-luxe p-6">
            <h3 className="font-heading text-base font-bold text-primary mb-5 pb-3 border-b border-gray-100">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Title <span className="text-sale">*</span></label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Product title"
                  className={`w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none transition-colors ${errors.title ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`} />
                {errors.title && <p className="font-body text-xs text-sale mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Slug</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-secondary">
                  <span className="px-3 py-3 bg-gray-50 border-r border-gray-200 font-body text-xs text-gray-400">/product/</span>
                  <input name="slug" value={form.slug} onChange={handleChange} className="flex-1 px-3 py-3 font-body text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Short Description</label>
                <textarea name="shortDesc" value={form.shortDesc} onChange={handleChange} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-secondary resize-none" />
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Full Description</label>
                <textarea name="longDesc" value={form.longDesc} onChange={handleChange} rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-secondary resize-none" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-luxe p-6">
            <h3 className="font-heading text-base font-bold text-primary mb-5 pb-3 border-b border-gray-100">Images</h3>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-colors ${errors.images ? 'border-sale/50' : 'border-gray-200 hover:border-secondary/50'}`}>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading || images.length >= 6} />
              <div className="text-4xl mb-2">📷</div>
              <p className="font-body text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload'}</p>
            </label>
            {errors.images && <p className="font-body text-xs text-sale mt-2">{errors.images}</p>}
            {images.length > 0 && (
              <div className="grid grid-cols-6 gap-2 mt-4">
                {images.map((img, i) => (
                  <div key={i} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${img.isMain ? 'border-secondary' : 'border-transparent'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center gap-1 opacity-0 hover:opacity-100 transition-all">
                      {!img.isMain && (
                        <button onClick={() => handleSetMain(i)} className="w-6 h-6 bg-secondary text-white rounded-full text-[10px] font-bold">★</button>
                      )}
                      <button onClick={() => handleRemoveImage(i)} className="w-6 h-6 bg-sale text-white rounded-full flex items-center justify-center">
                        <HiX className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white rounded-2xl shadow-luxe p-6">
            <h3 className="font-heading text-base font-bold text-primary mb-5 pb-3 border-b border-gray-100">Variants</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-2">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <button key={size} type="button" onClick={() => handleSizeToggle(size)}
                      className={`px-4 py-2 rounded-xl border text-sm font-body font-semibold transition-all ${form.sizes.includes(size) ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-secondary'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-2">Colors</label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map(({ name, hex }) => (
                    <button key={name} type="button" onClick={() => handleColorToggle(name.toLowerCase())} title={name}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all ${form.colors.includes(name.toLowerCase()) ? 'border-secondary scale-110 shadow-gold' : 'border-transparent hover:scale-105'} ${name === 'White' ? 'ring-1 ring-gray-200' : ''}`}
                      style={{ backgroundColor: hex }}>
                      {form.colors.includes(name.toLowerCase()) && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className={name === 'White' ? 'text-gray-800' : 'text-white'}>✓</span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-white rounded-2xl shadow-luxe p-6">
            <h3 className="font-heading text-base font-bold text-primary mb-4 pb-3 border-b border-gray-100">Status</h3>
            <div className="space-y-3">
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-secondary bg-white">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
              {[{ name: 'featured', label: '⭐ Featured' }, { name: 'newArrival', label: '🆕 New Arrival' }].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
                  <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} className="w-4 h-4 accent-secondary" />
                  <span className="font-body text-sm font-semibold text-primary">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl shadow-luxe p-6">
            <h3 className="font-heading text-base font-bold text-primary mb-4 pb-3 border-b border-gray-100">Category</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Category <span className="text-sale">*</span></label>
                <select name="category" value={form.category} onChange={handleChange}
                  className={`w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none bg-white ${errors.category ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`}>
                  <option value="">Select</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              {subCategories.length > 0 && (
                <div>
                  <label className="block font-body text-sm font-semibold text-primary mb-1.5">Sub-Category</label>
                  <select name="subCategory" value={form.subCategory} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-secondary bg-white">
                    <option value="">None</option>
                    {subCategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-luxe p-6">
            <h3 className="font-heading text-base font-bold text-primary mb-4 pb-3 border-b border-gray-100">Pricing</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Regular Price <span className="text-sale">*</span></label>
                <input type="number" name="regularPrice" value={form.regularPrice} onChange={handleChange} placeholder="0" min="0"
                  className={`w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none ${errors.regularPrice ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`} />
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Sale Price</label>
                <input type="number" name="salePrice" value={form.salePrice} onChange={handleChange} placeholder="Optional" min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-secondary" />
              </div>
              {discountPercent > 0 && (
                <div className="bg-sale/10 rounded-xl px-3 py-2 text-center">
                  <p className="font-body text-sm font-bold text-sale">{discountPercent}% OFF</p>
                </div>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-2xl shadow-luxe p-6">
            <h3 className="font-heading text-base font-bold text-primary mb-4 pb-3 border-b border-gray-100">Inventory</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">Stock <span className="text-sale">*</span></label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0"
                  className={`w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none ${errors.stock ? 'border-sale' : 'border-gray-200 focus:border-secondary'}`} />
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-primary mb-1.5">SKU</label>
                <input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. LF-001"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-secondary" />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-luxe p-6">
            <h3 className="font-heading text-base font-bold text-primary mb-4 pb-3 border-b border-gray-100">Tags</h3>
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag}
              placeholder="Type + Enter to add"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-secondary" />
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {form.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-primary/5 text-primary text-xs font-body px-2.5 py-1.5 rounded-full">
                    #{tag}
                    <button onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))} className="hover:text-sale">
                      <HiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Need HiX in scope
const { HiX } = require('react-icons/hi');

export default AdminEditProduct;