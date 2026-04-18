import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ViewToggleProps {
  value: string;
  onChange: (value: string) => void;
  options?: ViewToggleOption[];
}

const defaultOptions: ViewToggleOption[] = [
  { value: 'board', label: 'Board', icon: <LayoutGrid size={12} /> },
  { value: 'table', label: 'Table', icon: <List size={12} /> },
];

export default function ViewToggle({
  value,
  onChange,
  options = defaultOptions,
}: ViewToggleProps) {
  return (
    <div className="flex p-1 bg-surface-container-high rounded-full shadow-sm">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            value === option.value
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-500 hover:text-primary'
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
