import React from 'react';
import Spinner from './Spinner';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  'outline-gold': 'btn-outline-gold',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizes = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

const Button = ({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, fullWidth = false, icon: Icon, iconRight,
  className = '', type = 'button', ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {iconRight && !loading && <iconRight className="w-4 h-4" />}
    </button>
  );
};

export default Button;