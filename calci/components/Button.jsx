import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, className = '', disabled = false, variant = 'primary', size = 'md', ...props }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-slate-600 hover:bg-slate-500 text-white border-slate-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-500 text-white border-green-500';
      case 'danger':
        return 'bg-red-600 hover:bg-red-500 text-white border-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-500 text-white border-yellow-500';
      case 'outline':
        return 'bg-transparent hover:bg-slate-700 text-slate-300 border-slate-600 hover:text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-6 py-4 text-lg';
      case 'xl':
        return 'px-8 py-5 text-xl';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const baseStyles = 'font-semibold rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 font-inter';
  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95';

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${disabledStyles} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;