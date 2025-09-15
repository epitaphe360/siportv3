import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  hover = false
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-siports-gray-200 shadow-siports',
        paddingClasses[padding],
        hover && 'hover:shadow-siports-lg transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
};