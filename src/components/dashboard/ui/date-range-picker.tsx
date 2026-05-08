import { useState } from 'react';
import { DATE_PRESETS, getPresetRange, type PresetKey } from '../../../lib/date-range-presets';
import type { DateRange } from '../../../types/dashboard-product';

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
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
