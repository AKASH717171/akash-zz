import React, { useState } from 'react';
import { HiStar } from 'react-icons/hi';

const Rating = ({
  value = 0, max = 5, size = 'md', onChange, readOnly = false,
  showCount = false, count = 0, showValue = false, className = '',
}) => {
  const [hovered, setHovered] = useState(0);

  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {stars.map((star) => {
          const filled = readOnly
            ? star <= Math.round(value)
            : star <= (hovered || value);

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !readOnly && setHovered(star)}
              onMouseLeave={() => !readOnly && setHovered(0)}
              className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-colors duration-150 p-0.5`}
            >
              <HiStar className={`${sizeMap[size]} ${filled ? 'text-yellow-400' : 'text-gray-300'}`} />
            </button>
          );
        })}
      </div>

      {showValue && value > 0 && (
        <span className="text-sm font-body font-semibold text-dark ml-1">{value.toFixed(1)}</span>
      )}
      {showCount && (
        <span className="text-xs font-body text-gray-400 ml-1">({count})</span>
      )}
    </div>
  );
};

export default Rating;