interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function colorFor(value: number): string {
  if (value >= 7) return 'bg-emerald-500 text-emerald-50';
  if (value >= 4) return 'bg-amber-500 text-amber-50';
  return 'bg-rose-500 text-rose-50';
}

export default function ConfidenceSlider({ value, onChange, disabled = false }: ConfidenceSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-primary"
      />
      <span className={`min-w-[3rem] text-center px-2 py-1 rounded-full text-xs font-black ${colorFor(value)}`}>
        {value}/10
      </span>
    </div>
  );
}
