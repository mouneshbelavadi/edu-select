import React, { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'government' | 'private' | 'deemed' | 'primary' | 'secondary' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variantStyles = {
    government: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    private: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    deemed: 'bg-amber-50 text-amber-700 border-amber-200',
    primary: 'bg-brand-50 text-brand-700 border-brand-200',
    secondary: 'bg-surface-100 text-surface-700 border-surface-200',
    outline: 'bg-transparent text-surface-600 border-surface-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
