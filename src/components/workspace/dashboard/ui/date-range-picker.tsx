import { useState } from 'react';
import { DATE_PRESETS, getPresetRange, type PresetKey } from '@/lib/date-range-presets';
import type { DateRange } from '@/types/dashboard-product';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<PresetKey | 'custom'>('30d');

  const handlePresetClick = (key: PresetKey) => {
    setActivePreset(key);
    onChange(getPresetRange(key));
  };

  return (
    <div className="flex items-center gap-1">
      {DATE_PRESETS.map((preset) => (
        <button
          key={preset.key}
          onClick={() => handlePresetClick(preset.key)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            activePreset === preset.key
              ? 'bg-primary text-on-primary'
              : 'bg-surface-variant/60 text-on-surface hover:bg-surface-variant'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
