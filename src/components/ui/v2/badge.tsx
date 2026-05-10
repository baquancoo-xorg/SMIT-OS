import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  iconLeft?: ReactNode;
  /** When true, renders as a soft container variant (background = *-container, text = on-*-container) */
  soft?: boolean;
}

// Solid variants — high contrast (white text on saturated bg)
const variantSolid: Record<BadgeVariant, string> = {
  success: 'bg-success text-on-success',
  warning: 'bg-warning text-on-warning',
  error: 'bg-error text-on-error',
  info: 'bg-info text-on-info',
  neutral: 'bg-on-surface-variant text-surface-container-lowest',
  primary: 'bg-primary text-on-primary',
};

// Soft variants — subtle background, dark on-container text. Default per design tokens spec.
const variantSoft: Record<BadgeVariant, string> = {
  success: 'bg-success-container text-on-success-container',
  warning: 'bg-warning-container text-on-warning-container',
  error: 'bg-error-container text-on-error-container',
  info: 'bg-info-container text-on-info-container',
  neutral: 'bg-surface-container text-on-surface-variant',
  primary: 'bg-primary-container text-on-primary-container',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-[length:var(--text-caption)] gap-1 [&>svg]:size-3',
  md: 'h-6 px-2.5 text-[length:var(--text-label)] gap-1.5 [&>svg]:size-3.5',
};

/**
 * Badge v2 — Phase 4 component library.
 *
 * Soft (default) = container background + on-container text. Solid = saturated bg + white text.
 * Pill radius (`rounded-chip`) per design tokens spec.
 *
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error" soft={false}>Critical</Badge>
 * <Badge variant="info" iconLeft={<InfoIcon />}>New</Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'neutral',
      size = 'sm',
      soft = true,
      iconLeft,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const variantClass = soft ? variantSoft[variant] : variantSolid[variant];

    return (
      <span
        ref={ref}
        className={[
          'inline-flex items-center font-medium rounded-chip whitespace-nowrap',
          variantClass,
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {iconLeft}
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
