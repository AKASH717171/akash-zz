import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label, error, icon: Icon, type = 'text',
  className = '', containerClass = '', helpText, required,
  ...props
}, ref) => {
  return (
    <div className={containerClass}>
      {label && (
        <label className="label-luxe">
          {label}
          {required && <span className="text-sale ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            ref={ref}
            className={`input-luxe ${Icon ? 'pl-11' : ''} ${error ? 'input-error' : ''} ${className}`}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={type}
            className={`input-luxe ${Icon ? 'pl-11' : ''} ${error ? 'input-error' : ''} ${className}`}
            {...props}
          />
        )}
      </div>
      {error && <p className="text-xs text-sale mt-1 font-body">{error}</p>}
      {helpText && !error && <p className="text-xs text-gray-400 mt-1 font-body">{helpText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;