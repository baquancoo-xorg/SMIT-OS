import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export type StatusDotVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type StatusDotSize = 'sm' | 'md' | 'lg';

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: StatusDotVariant;
  size?: StatusDotSize;
  /** Pulse animation. Auto-disabled when prefers-reduced-motion is set (handled in CSS). */
  pulse?: boolean;
  /** Accessible label. If omitted, dot is decorative (aria-hidden). */
  label?: string;
}

const variantStyles: Record<StatusDotVariant, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  neutral: 'bg-on-surface-variant',
};

const sizeStyles: Record<StatusDotSize, string> = {
  sm: 'size-1.5',
  md: 'size-2',
  lg: 'size-2.5',
};

const ringSize: Record<StatusDotSize, string> = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
};

/**
 * StatusDot v2 — small colored dot indicator with optional pulse ring.
 *
 * Use to indicate live status (online, syncing, error, etc.) next to text labels.
 * Pulse animation respects `prefers-reduced-motion` via global CSS rule (Phase 2).
 *
 * @example
 * <StatusDot variant="success" pulse label="Server online" />
 * <StatusDot variant="warning" /> // decorative dot beside an icon
 */
export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(
  (
    {
      variant = 'neutral',
      size = 'md',
      pulse = false,
      label,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        role={label ? 'status' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className={[
          'relative inline-flex items-center justify-center',
          ringSize[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {pulse && (
          <span
            className={[
              'absolute inset-0 rounded-full opacity-60 animate-ping',
              variantStyles[variant],
            ].join(' ')}
            aria-hidden="true"
          />
        )}
        <span
          className={[
            'relative rounded-full',
            sizeStyles[size],
            variantStyles[variant],
          ].join(' ')}
          aria-hidden="true"
        />
      </span>
    );
  },
);

StatusDot.displayName = 'StatusDot';
