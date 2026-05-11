import { forwardRef, useRef, useEffect } from 'react';
import type { HTMLAttributes, ReactNode, KeyboardEvent } from 'react';

export interface TabPillItem<T extends string = string> {
  value: T;
  label: string;
  /** Optional icon shown left of label, sized to 16px. */
  icon?: ReactNode;
  /** Optional badge count shown right of label. */
  count?: number;
  disabled?: boolean;
}

export interface TabPillProps<T extends string = string> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabPillItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** ARIA label for the tablist (required for a11y). */
  label: string;
  /** `sm` for compact tabs in dialogs, `md` for page-level. */
  size?: 'sm' | 'md';
}

const sizeStyles = {
  sm: 'h-7 px-2.5 text-[length:var(--text-body-sm)] gap-1.5',
  md: 'h-10 px-4 text-[length:var(--text-body)] gap-2',
};

// Container padding per size. Total outer height = items height + padding * 2.
// sm: 28 + 2*2 = 32px (matches DateRangePicker h-8); md: 40 + 2*4 = 48px.
const containerPadding = {
  sm: 'p-0.5',
  md: 'p-1',
};

/**
 * TabPill v2 — controlled pill-style tab toggle.
 *
 * Replaces 4 page-header tab variants found in Phase 1 audit.
 * Keyboard: ArrowLeft/Right cycle, Home/End jump first/last.
 * ARIA tablist pattern.
 *
 * @example
 * <TabPill
 *   label="Dashboard tabs"
 *   value={tab}
 *   onChange={setTab}
 *   items={[
 *     { value: 'overview', label: 'Overview' },
 *     { value: 'sale', label: 'Sale', count: 3 },
 *     { value: 'product', label: 'Product' },
 *   ]}
 * />
 */
export const TabPill = forwardRef<HTMLDivElement, TabPillProps>(
  ({ items, value, onChange, label, size = 'md', className = '', ...props }, ref) => {
    const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    useEffect(() => {
      // Keep ref map fresh
      return () => {
        tabRefs.current.clear();
      };
    }, []);

    const enabledIndices = items
      .map((item, idx) => (item.disabled ? -1 : idx))
      .filter((i) => i !== -1);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();

      const currentIdx = items.findIndex((i) => i.value === value);
      const enabledPos = enabledIndices.indexOf(currentIdx);

      let nextIdx = currentIdx;
      if (e.key === 'ArrowRight') {
        nextIdx = enabledIndices[(enabledPos + 1) % enabledIndices.length];
      } else if (e.key === 'ArrowLeft') {
        nextIdx = enabledIndices[(enabledPos - 1 + enabledIndices.length) % enabledIndices.length];
      } else if (e.key === 'Home') {
        nextIdx = enabledIndices[0];
      } else if (e.key === 'End') {
        nextIdx = enabledIndices[enabledIndices.length - 1];
      }

      const nextValue = items[nextIdx].value;
      onChange(nextValue);
      tabRefs.current.get(nextValue)?.focus();
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className={[
          'inline-flex items-center gap-1 rounded-button bg-surface-container-low border border-outline-variant/40',
          containerPadding[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {items.map((item) => {
          const isActive = item.value === value;
          return (
            <button
              key={item.value}
              ref={(el) => {
                if (el) tabRefs.current.set(item.value, el);
                else tabRefs.current.delete(item.value);
              }}
              role="tab"
              aria-selected={isActive}
              aria-disabled={item.disabled || undefined}
              disabled={item.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(item.value)}
              className={[
                'inline-flex items-center justify-center font-medium rounded-button',
                'transition-colors motion-fast ease-standard',
                'focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-40',
                sizeStyles[size],
                isActive
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                '[&>svg]:size-4',
              ].join(' ')}
            >
              {item.icon}
              <span>{item.label}</span>
              {typeof item.count === 'number' && (
                <span
                  className={[
                    'ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[length:var(--text-caption)] font-semibold',
                    isActive
                      ? 'bg-on-primary/20 text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant',
                  ].join(' ')}
                  aria-label={`${item.count} items`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  },
) as <T extends string>(
  props: TabPillProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

(TabPill as unknown as { displayName: string }).displayName = 'TabPill';
