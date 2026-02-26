import React from 'react';

const Spinner = ({ size = 'md', text, fullScreen = false, className = '' }) => {
  const sizeMap = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizeMap[size]} border-accent-200 border-t-secondary rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-500 font-body animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="font-heading text-2xl text-primary mb-6">LUXE <span className="text-secondary">FASHION</span></h2>
          {spinner}
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>;
};

export default Spinner;