import type { ReactNode } from 'react';

interface SegmentedTabOption<T extends string> {
  label: string;
  value: T;
  icon?: ReactNode;
}

interface SegmentedTabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<SegmentedTabOption<T>>;
}

export default function SegmentedTabs<T extends string>({
  value,
  onChange,
  options,
}: SegmentedTabsProps<T>) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex bg-slate-100 rounded-full p-0.5 gap-0.5 min-w-max" role="tablist" aria-label="Dashboard domains">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={value === option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-center gap-1.5 h-7 px-3.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              value === option.value
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
