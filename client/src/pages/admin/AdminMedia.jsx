import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HiUpload, HiTrash, HiPhotograph, HiX, HiClipboard, HiCheck } from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminMedia = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // We store uploaded images in memory/state
  // Real images come from upload API responses
  const [allImages, setAllImages] = useState([]);

  const handleUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (validFiles.length === 0) return toast.error('Only images under 5MB allowed');

    setUploading(true);
    const uploadedImages = [];

    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post('/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data.success && data.image) {
          uploadedImages.push({
            url: data.image.url,
            publicId: data.image.publicId || '',
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        toast.error(`Failed to upload: ${file.name}`);
      }
    }

    if (uploadedImages.length > 0) {
      setAllImages((prev) => [...uploadedImages, ...prev]);
      toast.success(`${uploadedImages.length} image(s) uploaded!`);
    }
    setUploading(false);
  }, []);

  const handleDelete = async (img) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      if (img.publicId) {
        await api.delete('/upload', { data: { publicId: img.publicId } });
      }
      setAllImages((prev) => prev.filter((i) => i.url !== img.url));
      if (selected?.url === img.url) setSelected(null);
      toast.success('Image deleted');
    } catch { toast.error('Delete failed'); }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL copied!');
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const fmtSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary">Media Library</h2>
          <p className="font-body text-sm text-gray-400">{allImages.length} images uploaded this session</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-body text-sm font-semibold hover:bg-secondary/90 transition-colors shadow-gold"
        >
          <HiUpload className="w-4 h-4" /> Upload Images
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => handleUpload(e.target.files)} />
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => allImages.length === 0 && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl transition-all ${
          dragOver
            ? 'border-secondary bg-secondary/5 scale-[1.01]'
            : allImages.length === 0
            ? 'border-gray-200 bg-gray-50 cursor-pointer hover:border-secondary/50 hover:bg-secondary/5'
            : 'border-gray-100 bg-gray-50/30'
        } ${allImages.length === 0 ? 'p-16' : 'p-4'}`}
      >
        {allImages.length === 0 ? (
          <div className="text-center">
            {uploading ? (
              <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto mb-3" />
            ) : (
              <HiPhotograph className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            )}
            <p className="font-heading text-lg font-semibold text-gray-400 mb-1">
              {uploading ? 'Uploading...' : 'Drag & Drop images here'}
            </p>
            <p className="font-body text-sm text-gray-400">or click to browse · Max 5MB per image</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {/* Upload tile */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-secondary/50 hover:bg-secondary/5 transition-all"
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
              ) : (
                <>
                  <HiUpload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="font-body text-xs text-gray-400">Add More</span>
                </>
              )}
            </div>

            {/* Image tiles */}
            {allImages.map((img, i) => (
              <div
                key={i}
                onClick={() => setSelected(img)}
                className={`relative w-28 h-28 rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${
                  selected?.url === img.url ? 'border-secondary shadow-gold' : 'border-transparent hover:border-secondary/30'
                }`}
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(img); }}
                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Image Details */}
      {selected && (
        <div className="bg-white rounded-2xl shadow-luxe p-5">
          <div className="flex items-start gap-5">
            <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              <img src={selected.url} alt={selected.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-primary truncate">{selected.name}</h4>
                <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <HiX className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-body text-gray-400">Size:</span> <span className="font-body font-semibold text-primary">{fmtSize(selected.size)}</span></div>
                <div><span className="font-body text-gray-400">Date:</span> <span className="font-body font-semibold text-primary">{new Date(selected.uploadedAt).toLocaleDateString()}</span></div>
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-gray-500 block mb-1">Image URL</label>
                <div className="flex items-center gap-2">
                  <input readOnly value={selected.url}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl font-body text-xs text-gray-600 bg-gray-50 focus:outline-none truncate" />
                  <button onClick={() => copyUrl(selected.url)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${copiedUrl === selected.url ? 'bg-green-50 border-green-200 text-green-600' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}>
                    {copiedUrl === selected.url ? <HiCheck className="w-4 h-4" /> : <HiClipboard className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={selected.url} target="_blank" rel="noreferrer"
                  className="px-3 py-1.5 border border-gray-200 rounded-lg font-body text-xs font-semibold text-gray-600 hover:border-gray-300 transition-colors">
                  Open Original
                </a>
                <button onClick={() => handleDelete(selected)}
                  className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg font-body text-xs font-semibold text-red-500 hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedia;