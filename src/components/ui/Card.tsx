import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'glass' | 'panel' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'glass',
  ...props
}) => {
  const variants = {
    glass: 'glass-card rounded-2xl',
    panel: 'glass-panel rounded-2xl',
    flat: 'bg-white border border-slate-100 shadow-sm rounded-2xl'
  };

  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
