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
      <div className="flex h-10 bg-surface-container-high rounded-full shadow-sm w-max min-w-full md:min-w-0">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-4 md:px-5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
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
