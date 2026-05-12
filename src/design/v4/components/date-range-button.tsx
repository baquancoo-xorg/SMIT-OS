import { useRef, useState, type ReactNode } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';
import { useClickOutside } from '../primitives/use-click-outside';
import { useEscapeKey } from '../primitives/use-escape-key';
import { DateRangePicker, type DateRange } from './date-range-picker';

export interface DateRangeButtonProps {
  value: DateRange;
  onChange: (next: DateRange) => void;
  /** Optional preset chips inside the popover. */
  presets?: { label: ReactNode; range: () => DateRange }[];
  /** Optional pre-label shown before the dates (e.g. "Date range"). */
  label?: string;
  className?: string;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
}

/**
 * v4 DateRangeButton — compact pill button that opens DateRangePicker in a popover.
 *
 * @example
 *   <DateRangeButton value={range} onChange={setRange} presets={[...]} />
 */
export function DateRangeButton({ value, onChange, presets, label, className }: DateRangeButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);
  useEscapeKey(() => setOpen(false), open);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-snug h-11 rounded-pill px-comfy',
          'bg-surface-overlay border border-outline-subtle text-fg text-body-sm font-medium',
          'transition-colors duration-fast hover:border-outline',
          open && 'border-accent shadow-focus',
        )}
      >
        <Calendar size={14} aria-hidden="true" className="text-fg-subtle" />
        {label && <span className="text-fg-muted">{label}</span>}
        <span>{formatDate(value.from)} → {formatDate(value.to)}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={cn('text-fg-subtle transition-transform duration-fast', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Date range picker"
          className={cn(
            'absolute right-0 top-full mt-tight z-dropdown',
            'min-w-[320px] rounded-input border border-outline-subtle bg-surface-popover p-comfy shadow-elevated',
          )}
        >
          <DateRangePicker value={value} onChange={onChange} presets={presets} />
        </div>
      )}
    </div>
  );
}
