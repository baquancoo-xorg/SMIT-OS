import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface FilterChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  active?: boolean;
  /** Optional icon before the label. */
  icon?: ReactNode;
  /** Count badge after the label. */
  count?: number;
  /** Removable: shows × button. Calls `onRemove` instead of `onClick` when clicked. */
  onRemove?: () => void;
  children: ReactNode;
}

/**
 * v4 FilterChip — toggle pill for table/list filters. Active state uses accent-soft fill.
 *
 * @example
 *   <FilterChip active={isOpen} onClick={() => toggle('open')}>Open</FilterChip>
 *   <FilterChip active onRemove={() => clear()}>Status: Done</FilterChip>
 */
export function FilterChip({ active = false, icon, count, onRemove, className, children, type = 'button', ...rest }: FilterChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-xs rounded-pill border h-7 pl-sm pr-xs text-body-sm transition-colors duration-fast',
        active
          ? 'bg-accent-soft border-[color-mix(in_srgb,var(--brand-500)_40%,transparent)] text-accent'
          : 'bg-surface-overlay border-outline-subtle text-fg-muted hover:text-fg hover:border-outline',
      )}
    >
      <button type={type} className={cn('inline-flex items-center gap-xs', className)} {...rest}>
        {icon && <span aria-hidden="true" className="inline-flex shrink-0">{icon}</span>}
        <span>{children}</span>
        {count !== undefined && (
          <span className="inline-flex items-center justify-center rounded-pill bg-surface px-xs text-caption text-fg-subtle">
            {count}
          </span>
        )}
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove filter"
          className={cn(
            'inline-flex size-5 items-center justify-center rounded-pill text-fg-subtle',
            'hover:bg-surface hover:text-fg transition-colors duration-fast',
          )}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </span>
  );
}
