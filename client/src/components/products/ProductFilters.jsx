import React, { useState, useEffect } from 'react';
import { HiX, HiChevronDown, HiChevronUp } from 'react-icons/hi';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Black', value: 'black', hex: '#111111' },
  { name: 'White', value: 'white', hex: '#FFFFFF' },
  { name: 'Red', value: 'red', hex: '#E74C3C' },
  { name: 'Navy', value: 'navy', hex: '#1A1A2E' },
  { name: 'Gold', value: 'gold', hex: '#C4A35A' },
  { name: 'Pink', value: 'pink', hex: '#F48FB1' },
  { name: 'Blue', value: 'blue', hex: '#3498DB' },
  { name: 'Green', value: 'green', hex: '#27AE60' },
  { name: 'Beige', value: 'beige', hex: '#E8D5B7' },
  { name: 'Brown', value: 'brown', hex: '#795548' },
];

const AccordionSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left font-body font-semibold text-primary text-sm uppercase tracking-wider mb-0"
      >
        {title}
        {open ? <HiChevronUp className="w-4 h-4 text-secondary" /> : <HiChevronDown className="w-4 h-4 text-secondary" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

const ProductFilters = ({ categories = [], filters, onChange, onClear, isMobile = false }) => {
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || '',
    minPrice: filters.minPrice || 0,
    maxPrice: filters.maxPrice || 10000,
    sizes: filters.sizes ? filters.sizes.split(',') : [],
    colors: filters.colors ? filters.colors.split(',') : [],
  });

  useEffect(() => {
    setLocalFilters({
      category: filters.category || '',
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 10000,
      sizes: filters.sizes ? filters.sizes.split(',') : [],
      colors: filters.colors ? filters.colors.split(',') : [],
    });
  }, [filters]);

  const handleCategory = (slug) => {
    const val = localFilters.category === slug ? '' : slug;
    const updated = { ...localFilters, category: val };
    setLocalFilters(updated);
    if (!isMobile) applyFilters(updated);
  };

  const handleSize = (size) => {
    const sizes = localFilters.sizes.includes(size)
      ? localFilters.sizes.filter(s => s !== size)
      : [...localFilters.sizes, size];
    const updated = { ...localFilters, sizes };
    setLocalFilters(updated);
    if (!isMobile) applyFilters(updated);
  };

  const handleColor = (color) => {
    const colors = localFilters.colors.includes(color)
      ? localFilters.colors.filter(c => c !== color)
      : [...localFilters.colors, color];
    const updated = { ...localFilters, colors };
    setLocalFilters(updated);
    if (!isMobile) applyFilters(updated);
  };

  const handlePriceChange = (key, val) => {
    setLocalFilters(prev => ({ ...prev, [key]: Number(val) }));
  };

  const applyFilters = (f = localFilters) => {
    onChange({
      category: f.category,
      minPrice: f.minPrice > 0 ? f.minPrice : '',
      maxPrice: f.maxPrice < 10000 ? f.maxPrice : '',
      sizes: f.sizes.length > 0 ? f.sizes.join(',') : '',
      colors: f.colors.length > 0 ? f.colors.join(',') : '',
    });
  };

  const handleClear = () => {
    const cleared = { category: '', minPrice: 0, maxPrice: 10000, sizes: [], colors: [] };
    setLocalFilters(cleared);
    onClear();
  };

  const activeCount = [
    localFilters.category,
    localFilters.minPrice > 0 || localFilters.maxPrice < 10000,
    localFilters.sizes.length > 0,
    localFilters.colors.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-luxe p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-heading text-lg font-bold text-primary">
          Filters
          {activeCount > 0 && (
            <span className="ml-2 text-xs bg-secondary text-white rounded-full px-2 py-0.5 font-body">
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-sale hover:text-red-700 font-body font-medium transition-colors"
          >
            <HiX className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <AccordionSection title="Category">
        <div className="space-y-2">
          {categories.map(cat => (
            <label
              key={cat._id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                checked={localFilters.category === cat.slug}
                onChange={() => handleCategory(cat.slug)}
                className="w-4 h-4 accent-secondary cursor-pointer"
              />
              <span className="text-sm font-body text-gray-600 group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </AccordionSection>

      {/* Price Range */}
      <AccordionSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm font-body">
            <span className="text-secondary font-semibold">${localFilters.minPrice.toLocaleString()}</span>
            <span className="text-secondary font-semibold">${localFilters.maxPrice.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={localFilters.minPrice}
            onChange={e => handlePriceChange('minPrice', e.target.value)}
            onMouseUp={() => !isMobile && applyFilters()}
            onTouchEnd={() => !isMobile && applyFilters()}
            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-secondary"
          />
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={localFilters.maxPrice}
            onChange={e => handlePriceChange('maxPrice', e.target.value)}
            onMouseUp={() => !isMobile && applyFilters()}
            onTouchEnd={() => !isMobile && applyFilters()}
            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-secondary"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={localFilters.minPrice}
              onChange={e => handlePriceChange('minPrice', e.target.value)}
              placeholder="Min"
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-body text-gray-700 focus:outline-none focus:border-secondary"
            />
            <input
              type="number"
              value={localFilters.maxPrice}
              onChange={e => handlePriceChange('maxPrice', e.target.value)}
              placeholder="Max"
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-body text-gray-700 focus:outline-none focus:border-secondary"
            />
          </div>
        </div>
      </AccordionSection>

      {/* Sizes */}
      <AccordionSection title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => handleSize(size)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-body font-semibold transition-all duration-200 ${
                localFilters.sizes.includes(size)
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Colors */}
      <AccordionSection title="Color">
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map(color => (
            <button
              key={color.value}
              onClick={() => handleColor(color.value)}
              title={color.name}
              className={`relative w-7 h-7 rounded-full transition-all duration-200 ${
                localFilters.colors.includes(color.value)
                  ? 'ring-2 ring-offset-2 ring-secondary scale-110'
                  : 'hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'
              } ${color.value === 'white' ? 'border border-gray-200' : ''}`}
              style={{ backgroundColor: color.hex }}
            >
              {localFilters.colors.includes(color.value) && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={color.value === 'white' ? '#333' : 'white'} strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Mobile Apply Button */}
      {isMobile && (
        <button
          onClick={() => applyFilters()}
          className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-body font-semibold text-sm
                     hover:bg-secondary transition-colors duration-300 shadow-luxe"
        >
          Apply Filters
          {activeCount > 0 && ` (${activeCount})`}
        </button>
      )}
    </div>
  );
};

export default ProductFilters;