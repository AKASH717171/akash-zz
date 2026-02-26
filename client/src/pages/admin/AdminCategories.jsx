import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiX, HiChevronDown, HiChevronRight } from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CategoryModal = ({ category, categories, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    parent: category?.parent?._id || category?.parent || '',
    order: category?.order || 0,
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(category?.image || '');

  const slugify = (text) =>
    text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' ? { slug: slugify(value) } : {}),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      let imageUrl = category?.image || '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const { data: uploadData } = await api.post('/upload/single', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadData.success) imageUrl = uploadData.url;
      }
      await onSave({ ...form, image: imageUrl });
    } finally {
      setLoading(false);
    }
  };

  // Filter out current category and its children from parent options
  const parentOptions = categories.filter(c =>
    !c.parent && (!category || c._id !== category._id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-luxe-xl w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-heading text-lg font-bold text-primary">
            {category ? 'Edit Category' : 'Add Category'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {imagePreview
                ? <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl">🏷️</div>}
            </div>
            <div>
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl cursor-pointer
                               font-body text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                Upload Image
              </label>
              <p className="font-body text-xs text-gray-400 mt-1">Optional category image</p>
            </div>
          </div>

          <div>
            <label className="block font-body text-sm font-semibold text-primary mb-1.5">
              Name <span className="text-sale">*</span>
            </label>
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="Category name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                         focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block font-body text-sm font-semibold text-primary mb-1.5">Slug</label>
            <input
              name="slug" value={form.slug} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                         focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block font-body text-sm font-semibold text-primary mb-1.5">Parent Category</label>
            <select
              name="parent" value={form.parent} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                         focus:outline-none focus:border-secondary bg-white"
            >
              <option value="">None (Top Level)</option>
              {parentOptions.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-body text-sm font-semibold text-primary mb-1.5">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              rows={2} placeholder="Optional description"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                         focus:outline-none focus:border-secondary resize-none"
            />
          </div>

          <div>
            <label className="block font-body text-sm font-semibold text-primary mb-1.5">Display Order</label>
            <input
              type="number" name="order" value={form.order} onChange={handleChange} min="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm
                         focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl font-body font-semibold text-sm text-gray-600">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-body font-semibold text-sm
                         hover:bg-secondary transition-colors disabled:opacity-60">
              {loading ? '...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoryRow = ({ cat, onEdit, onDelete, depth = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = cat.children?.length > 0;

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors border-b border-gray-50">
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
            {hasChildren ? (
              <button onClick={() => setExpanded(!expanded)} className="w-5 h-5 flex items-center justify-center text-gray-400">
                {expanded ? <HiChevronDown className="w-4 h-4" /> : <HiChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-5 h-5 flex items-center justify-center text-gray-200">
                {depth > 0 ? '└' : ''}
              </span>
            )}
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {cat.image
                ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xl">🏷️</div>}
            </div>
            <div>
              <p className="font-body font-semibold text-primary text-sm">{cat.name}</p>
              <p className="font-body text-xs text-gray-400">{cat.slug}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5 font-body text-xs text-gray-500">
          {cat.parent ? 'Sub-category' : 'Main Category'}
        </td>
        <td className="px-4 py-3.5 font-body text-xs text-gray-500">
          {cat.children?.length || 0} sub-categories
        </td>
        <td className="px-4 py-3.5 font-body text-xs text-gray-400">
          {cat.order || 0}
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(cat)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                         hover:bg-secondary/10 hover:text-secondary transition-all"
            >
              <HiPencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(cat)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                         hover:bg-sale/10 hover:text-sale transition-all"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {hasChildren && expanded && cat.children.map(child => (
        <CategoryRow key={child._id} cat={child} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
      ))}
    </>
  );
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | category object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      if (data.success) setCategories(data.categories || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async (formData) => {
    try {
      const isEdit = modal !== 'add' && modal?._id;
      const { data } = isEdit
        ? await api.put(`/categories/${modal._id}`, formData)
        : await api.post('/categories', formData);

      if (data.success) {
        toast.success(isEdit ? 'Category updated!' : 'Category created!');
        setModal(null);
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/categories/${deleteTarget._id}`);
      if (data.success) {
        toast.success('Category deleted');
        setDeleteTarget(null);
        fetchCategories();
      } else {
        toast.error(data.message || 'Cannot delete — may have products');
      }
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Flatten categories for modal selector
  const flatCategories = categories.reduce((acc, cat) => {
    acc.push(cat);
    if (cat.children) acc.push(...cat.children);
    return acc;
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary">Categories</h2>
          <p className="font-body text-sm text-gray-400">Manage product categories and sub-categories</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl
                     font-body font-semibold text-sm hover:bg-secondary transition-colors shadow-luxe"
        >
          <HiPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-luxe overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Category', 'Type', 'Children', 'Order', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left font-body font-semibold text-xs text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="skeleton h-4 rounded" style={{ width: '60%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="text-4xl mb-3">🏷️</div>
                    <p className="font-heading text-lg font-bold text-primary mb-1">No Categories Yet</p>
                    <p className="font-body text-sm text-gray-400 mb-4">Add your first category to get started.</p>
                    <button
                      onClick={() => setModal('add')}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl font-body font-semibold text-sm hover:bg-secondary transition-colors"
                    >
                      Add Category
                    </button>
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <CategoryRow
                    key={cat._id}
                    cat={cat}
                    onEdit={(c) => setModal(c)}
                    onDelete={(c) => setDeleteTarget(c)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <CategoryModal
          category={modal === 'add' ? null : modal}
          categories={flatCategories}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-luxe-xl p-6 w-full max-w-sm animate-scale-in text-center">
            <div className="w-14 h-14 bg-sale/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiTrash className="w-7 h-7 text-sale" />
            </div>
            <h3 className="font-heading text-lg font-bold text-primary mb-2">Delete Category</h3>
            <p className="font-body text-sm text-gray-500 mb-6">
              Delete "<span className="font-semibold text-primary">{deleteTarget.name}</span>"?
              {deleteTarget.children?.length > 0 && (
                <span className="block text-sale mt-1 text-xs">Warning: This category has sub-categories.</span>
              )}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-body font-semibold text-sm text-gray-600">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 py-2.5 bg-sale text-white rounded-xl font-body font-semibold text-sm hover:bg-red-700 disabled:opacity-60">
                {deleteLoading ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;