import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'panel' | 'flat';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'glass' 
}) => {
  const variants = {
    glass: 'glass-card rounded-2xl',
    panel: 'glass-panel rounded-2xl',
    flat: 'bg-white border border-slate-100 shadow-sm rounded-2xl'
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
