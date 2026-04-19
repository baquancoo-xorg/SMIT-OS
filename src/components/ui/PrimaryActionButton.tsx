import React from 'react';

interface PrimaryActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export default function PrimaryActionButton({
  onClick,
  icon,
  children,
  disabled = false,
  className = '',
}: PrimaryActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 h-10 bg-primary text-white px-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all min-w-[130px] whitespace-nowrap disabled:opacity-50 disabled:hover:scale-100 ${className}`}
    >
      {icon ?? <span className="material-symbols-outlined text-[14px]">add</span>}
      {children}
    </button>
  );
}
