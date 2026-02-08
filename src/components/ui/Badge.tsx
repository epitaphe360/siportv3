import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

const BadgeComponent: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-siports-gray-100 text-siports-gray-800',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-siports-gold/20 text-siports-dark border border-siports-gold/30',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-siports-primary/10 text-siports-primary border border-siports-primary/20',
    outline: 'bg-transparent border border-current'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

// OPTIMIZATION: Memo for Badge prevents unnecessary re-renders
export const Badge = React.memo(BadgeComponent);