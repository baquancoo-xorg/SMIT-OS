import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface TabPillItem<V extends string = string> {
  value: V;
  label: ReactNode;
  /** Optional count badge next to the label. */
  count?: number | string;
  disabled?: boolean;
}

export interface TabPillProps<V extends string = string> {
  value: V;
  onChange: (next: V) => void;
  items: TabPillItem<V>[];
  /** Visual density. Default md. */
  size?: 'sm' | 'md';
  className?: string;
  'aria-label'?: string;
}

const sizeClass = {
  sm: 'h-8 text-caption px-sm',
  md: 'h-9 text-body-sm px-md',
} as const;

/**
 * v4 TabPill — segmented control inside a rounded-pill track. Used for chart filters etc.
 *
 * @example
 *   <TabPill value={tab} onChange={setTab} items={[{value:'income',label:'Income'},{value:'expense',label:'Expense'}]} />
 */
export function TabPill<V extends string = string>({ value, onChange, items, size = 'md', className, ...rest }: TabPillProps<V>) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex items-center gap-xs rounded-pill bg-surface-overlay p-xs border border-outline-subtle', className)}
      {...rest}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange(item.value)}
            className={cn(
              'inline-flex items-center gap-xs rounded-pill font-medium transition-colors duration-fast',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              sizeClass[size],
              active
                ? 'bg-surface text-fg shadow-card'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-pill px-xs text-caption',
                  active ? 'bg-accent-soft text-accent' : 'bg-surface-overlay text-fg-subtle',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
