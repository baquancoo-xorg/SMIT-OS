import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/cn';
import { DatePicker } from './date-picker';

export interface DateRange {
  from: string;
  to: string;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (next: DateRange) => void;
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  min?: string;
  max?: string;
  /** Optional preset chips above the inputs (e.g. "Last 7d", "MTD"). */
  presets?: { label: ReactNode; range: () => DateRange }[];
  className?: string;
}

/**
 * v4 DateRangePicker — two native date inputs side-by-side. Validates `from <= to`.
 *
 * @example
 *   <DateRangePicker
 *     value={range}
 *     onChange={setRange}
 *     presets={[
 *       { label: 'Last 7d', range: () => ({...}) },
 *     ]}
 *   />
 */
export function DateRangePicker({ value, onChange, label, helper, error, min, max, presets, className }: DateRangePickerProps) {
  const onFrom = (next: string) => onChange({ from: next, to: value.to });
  const onTo = (next: string) => onChange({ from: value.from, to: next });

  return (
    <div className={cn('flex flex-col gap-snug', className)}>
      {label && <label className="text-label font-medium text-fg-muted">{label}</label>}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-tight">
          {presets.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(p.range())}
              className="inline-flex items-center rounded-pill border border-outline-subtle bg-surface-overlay px-snug h-7 text-caption text-fg-muted hover:text-fg hover:border-outline transition-colors duration-fast"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-snug">
        <DatePicker value={value.from} onChange={(e) => onFrom(e.target.value)} min={min} max={value.to || max} />
        <ArrowRight size={16} aria-hidden="true" className="text-fg-subtle shrink-0" />
        <DatePicker value={value.to} onChange={(e) => onTo(e.target.value)} min={value.from || min} max={max} />
      </div>
      {error ? <p className="text-caption text-error">{error}</p> : helper ? <p className="text-caption text-fg-subtle">{helper}</p> : null}
    </div>
  );
}
