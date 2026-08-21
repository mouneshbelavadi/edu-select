import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-surface-200 shadow-sm transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-surface-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
