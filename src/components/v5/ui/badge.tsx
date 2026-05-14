import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../lib/cn';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'primary'
  | 'todo'
  | 'in-progress'
  | 'review'
  | 'done';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  iconLeft?: ReactNode;
  soft?: boolean;
}

const variantSoft: Record<BadgeVariant, string> = {
  success: 'bg-success-container text-on-success-container border-success/20',
  warning: 'bg-warning-container text-on-warning-container border-warning/20',
  error: 'bg-error-container text-on-error-container border-error/20',
  info: 'bg-info-container text-on-info-container border-info/20',
  neutral: 'bg-surface-2 text-text-2 border-border',
  primary: 'bg-accent-dim text-accent-text border-accent/20',
  todo: 'bg-surface-2 text-text-muted border-border',
  'in-progress': 'bg-info-container text-on-info-container border-info/20',
  review: 'bg-warning-container text-on-warning-container border-warning/20',
  done: 'bg-success-container text-on-success-container border-success/20',
};

const variantSolid: Record<BadgeVariant, string> = {
  success: 'bg-success text-on-success border-success',
  warning: 'bg-warning text-on-warning border-warning',
  error: 'bg-error text-on-error border-error',
  info: 'bg-info text-on-info border-info',
  neutral: 'bg-text-muted text-bg border-text-muted',
  primary: 'bg-accent text-on-primary border-accent',
  todo: 'bg-text-muted text-bg border-text-muted',
  'in-progress': 'bg-info text-on-info border-info',
  review: 'bg-warning text-on-warning border-warning',
  done: 'bg-success text-on-success border-success',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'min-h-5 px-2 text-[11px] gap-1 [&>svg]:size-3',
  md: 'min-h-6 px-2.5 text-xs gap-1.5 [&>svg]:size-3.5',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', size = 'sm', soft = true, iconLeft, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('inline-flex items-center rounded-chip border font-bold whitespace-nowrap', soft ? variantSoft[variant] : variantSolid[variant], sizeStyles[size], className)}
      {...props}
    >
      {iconLeft}
      {children}
    </span>
  ),
);

Badge.displayName = 'Badge';
