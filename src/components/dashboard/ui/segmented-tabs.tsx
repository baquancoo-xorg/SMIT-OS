interface SegmentedTabOption<T extends string> {
  label: string;
  value: T;
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
      <div className="inline-flex h-10 bg-surface-container-high rounded-full shadow-sm min-w-max" role="tablist" aria-label="Dashboard domains">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={value === option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-center gap-2 h-10 px-5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              value === option.value
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
