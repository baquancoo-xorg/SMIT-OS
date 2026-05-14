import { forwardRef, useState } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subDays, subMonths, startOfQuarter, endOfQuarter } from 'date-fns';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangePreset {
  key: string;
  label: string;
  /** Pure function returning the range. Called when preset is clicked. */
  range: () => DateRange;
}

export type DateRangePickerSize = 'sm' | 'md';

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** ARIA label for the trigger button. */
  label?: string;
  /** Custom preset list. Defaults to Vietnamese: Hôm nay / 7 ngày qua / 30 ngày qua / Tháng này / Tháng trước / Q này. */
  presets?: DateRangePreset[];
  /** Size variant. 'sm' = h-8 (32px), 'md' = h-10 (40px, default). */
  size?: DateRangePickerSize;
  /** Extra class names for the trigger button. */
  buttonClassName?: string;
  /** Disable the trigger. */
  disabled?: boolean;
  className?: string;
}

const today = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export const DEFAULT_PRESETS: DateRangePreset[] = [
  { key: 'today', label: 'Hôm nay', range: () => ({ from: today(), to: endOfDay(today()) }) },
  {
    key: 'yesterday',
    label: 'Hôm qua',
    range: () => {
      const y = subDays(today(), 1);
      return { from: y, to: endOfDay(y) };
    },
  },
  { key: '7d', label: '7 ngày qua', range: () => ({ from: subDays(today(), 6), to: endOfDay(today()) }) },
  { key: '30d', label: '30 ngày qua', range: () => ({ from: subDays(today(), 29), to: endOfDay(today()) }) },
  { key: 'tm', label: 'Tháng này', range: () => ({ from: startOfMonth(today()), to: endOfDay(endOfMonth(today())) }) },
  {
    key: 'lm',
    label: 'Tháng trước',
    range: () => {
      const lm = subMonths(today(), 1);
      return { from: startOfMonth(lm), to: endOfDay(endOfMonth(lm)) };
    },
  },
  {
    key: 'tq',
    label: 'Quý này',
    range: () => ({ from: startOfQuarter(today()), to: endOfDay(endOfQuarter(today())) }),
  },
];

const SIZE_CLASSES: Record<DateRangePickerSize, string> = {
  sm: 'h-8 px-3 text-[length:var(--text-body-sm)] gap-1.5',
  md: 'h-10 px-3 text-[length:var(--text-body)] gap-2',
};

function formatRange(range: DateRange): string {
  const sameYear = range.from.getFullYear() === range.to.getFullYear();
  const sameDay = range.from.toDateString() === range.to.toDateString();
  if (sameDay) return format(range.from, 'd MMM yyyy');
  if (sameYear) return `${format(range.from, 'd MMM')} – ${format(range.to, 'd MMM yyyy')}`;
  return `${format(range.from, 'd MMM yyyy')} – ${format(range.to, 'd MMM yyyy')}`;
}

function toInputValue(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/**
 * DateRangePicker v2 — preset shortcuts + custom date inputs.
 *
 * Headless UI Popover for portal/focus management.
 * Preset list lives left, custom inputs right. Click preset = instant apply + close.
 *
 * @example
 * const [range, setRange] = useState<DateRange>(DEFAULT_PRESETS[2].range());
 * <DateRangePicker value={range} onChange={setRange} label="Filter date" size="sm" />
 */
export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      value,
      onChange,
      label = 'Date range',
      presets = DEFAULT_PRESETS,
      size = 'md',
      buttonClassName = '',
      disabled,
      className = '',
    },
    ref,
  ) => {
    const [draftFrom, setDraftFrom] = useState(toInputValue(value.from));
    const [draftTo, setDraftTo] = useState(toInputValue(value.to));

    const applyCustom = (close: () => void) => {
      const from = new Date(draftFrom);
      const to = new Date(draftTo);
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;
      if (from > to) return;
      onChange({ from, to: endOfDay(to) });
      close();
    };

    return (
      <div ref={ref} className={className}>
        <Popover className="relative">
          {({ close }) => (
            <>
              <PopoverButton
                aria-label={label}
                disabled={disabled}
                className={[
                  'inline-flex items-center rounded-input border border-outline-variant bg-surface-container-lowest',
                  'text-on-surface',
                  'transition-colors motion-fast ease-standard',
                  'hover:border-accent/25 hover:shadow-glass focus-visible:outline-none focus-visible:border-accent/25 data-[open]:border-accent/25',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  SIZE_CLASSES[size],
                  buttonClassName,
                ].join(' ')}
              >
                <Calendar aria-hidden="true" className={size === 'sm' ? 'size-3.5 text-on-surface-variant' : 'size-4 text-on-surface-variant'} />
                <span>{formatRange(value)}</span>
                <ChevronDown aria-hidden="true" className={size === 'sm' ? 'size-3.5 text-on-surface-variant' : 'size-4 text-on-surface-variant'} />
              </PopoverButton>

              <PopoverPanel
                anchor={{ to: 'bottom start', gap: 8 }}
                className={[
                  'z-dropdown flex w-[28rem] gap-2 rounded-card border border-outline-variant',
                  'bg-surface shadow-elevated p-2',
                  'data-closed:opacity-0 transition-opacity motion-fast ease-standard',
                ].join(' ')}
              >
                <ul className="flex w-1/2 flex-col gap-0.5 border-r border-outline-variant/40 pr-2">
                  {presets.map((preset) => (
                    <li key={preset.key}>
                      <button
                        type="button"
                        className="w-full rounded-button px-3 py-1.5 text-left text-[length:var(--text-body-sm)] text-on-surface hover:bg-surface-container-low focus-visible:outline-none focus-visible:bg-surface-container"
                        onClick={() => {
                          const r = preset.range();
                          onChange(r);
                          setDraftFrom(toInputValue(r.from));
                          setDraftTo(toInputValue(r.to));
                          close();
                        }}
                      >
                        {preset.label}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="flex w-1/2 flex-col gap-2 p-2">
                  <label className="flex flex-col gap-1 text-[length:var(--text-label)] font-medium text-on-surface-variant">
                    Từ
                    <input
                      type="date"
                      value={draftFrom}
                      onChange={(e) => setDraftFrom(e.target.value)}
                      className="h-9 rounded-input border border-outline-variant bg-surface px-2 text-[length:var(--text-body-sm)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-[length:var(--text-label)] font-medium text-on-surface-variant">
                    Đến
                    <input
                      type="date"
                      value={draftTo}
                      min={draftFrom}
                      onChange={(e) => setDraftTo(e.target.value)}
                      className="h-9 rounded-input border border-outline-variant bg-surface px-2 text-[length:var(--text-body-sm)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => applyCustom(close)}
                    className="mt-1 relative inline-flex h-9 items-center justify-center overflow-hidden rounded-button border border-accent/30 bg-[linear-gradient(135deg,#1a1714_0%,#2e2925_100%)] text-[length:var(--text-body-sm)] font-semibold text-text-1 shadow-sm before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-accent/60 hover:border-accent/50 hover:shadow-glass active:scale-[0.99] focus-visible:outline-none"
                  >
                    Áp dụng
                  </button>
                </div>
              </PopoverPanel>
            </>
          )}
        </Popover>
      </div>
    );
  },
);

DateRangePicker.displayName = 'DateRangePicker';
