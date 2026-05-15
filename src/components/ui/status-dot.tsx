import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export type StatusDotVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type StatusDotSize = 'sm' | 'md' | 'lg';

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: StatusDotVariant;
  size?: StatusDotSize;
  pulse?: boolean;
  label?: string;
}

const variantStyles: Record<StatusDotVariant, string> = {
  success: 'bg-success shadow-[0_0_10px_color-mix(in_oklab,var(--status-success)_55%,transparent)]',
  warning: 'bg-warning shadow-[0_0_10px_color-mix(in_oklab,var(--status-warning)_55%,transparent)]',
  error: 'bg-error shadow-[0_0_10px_color-mix(in_oklab,var(--status-error)_55%,transparent)]',
  info: 'bg-info shadow-[0_0_10px_color-mix(in_oklab,var(--status-info)_55%,transparent)]',
  neutral: 'bg-on-surface-variant shadow-[0_0_10px_color-mix(in_oklab,var(--sys-color-text-muted)_35%,transparent)]',
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
              'absolute inset-0 rounded-full opacity-60 animate-ping motion-reduce:animate-none',
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
