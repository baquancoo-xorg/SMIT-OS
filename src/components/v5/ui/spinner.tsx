import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  /** Accessible label announced to screen readers. Default: "Loading". */
  label?: string;
  /** Hide visually but keep ARIA semantics. */
  hideLabel?: boolean;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-[3px]',
  xl: 'size-12 border-4',
};

/**
 * Spinner v2 — generic loading indicator using `currentColor` stroke.
 *
 * Inherits text color of parent → use `text-primary` / `text-on-primary` to recolor.
 * `role="status"` + `aria-label` pair announces loading state to screen readers.
 *
 * @example
 * <Spinner size="md" label="Loading dashboard" />
 * <Button isLoading>...</Button>  // Button uses an inline variant internally
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  (
    {
      size = 'md',
      label = 'Loading',
      hideLabel = true,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        role="status"
        aria-live="polite"
        className={['inline-flex items-center gap-2 text-current', className].filter(Boolean).join(' ')}
        {...props}
      >
        <span
          aria-hidden="true"
          className={[
            'inline-block animate-spin rounded-full border-current/20 border-t-current',
            sizeStyles[size],
          ].join(' ')}
        />
        <span className={hideLabel ? 'sr-only' : 'text-[length:var(--text-body-sm)]'}>{label}</span>
      </span>
    );
  },
);

Spinner.displayName = 'Spinner';
