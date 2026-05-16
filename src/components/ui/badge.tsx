import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Ban, CheckCircle2, Circle, CircleDashed, Clock3, ClipboardList, MinusCircle, PauseCircle, PlusCircle, RotateCcw, Shapes } from 'lucide-react';
import { cn } from '../../lib/cn';

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
  | 'design-review'
  | 'rework'
  | 'done'
  | 'not-started'
  | 'blocked'
  | 'on-hold'
  | 'archived';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  iconLeft?: ReactNode;
  soft?: boolean;
}

const variantSoft: Record<BadgeVariant, string> = {
  success: 'bg-success-container text-on-success-container border-success/35 shadow-[0_0_16px_color-mix(in_oklab,var(--status-success)_18%,transparent)] [&>svg]:text-success',
  warning: 'bg-warning-container text-on-warning-container border-warning/35 shadow-[0_0_16px_color-mix(in_oklab,var(--status-warning)_18%,transparent)] [&>svg]:text-warning',
  error: 'bg-error-container text-on-error-container border-error/35 shadow-[0_0_16px_color-mix(in_oklab,var(--status-error)_18%,transparent)] [&>svg]:text-error',
  info: 'bg-info-container text-on-info-container border-info/35 shadow-[0_0_16px_color-mix(in_oklab,var(--status-info)_18%,transparent)] [&>svg]:text-info',
  neutral: 'bg-surface-2 text-text-2 border-border-strong shadow-[0_0_14px_color-mix(in_oklab,var(--sys-color-text-muted)_14%,transparent)] [&>svg]:text-text-muted',
  primary: 'bg-accent-dim text-accent-text border-accent/35 shadow-[0_0_16px_var(--sys-color-accent-dim)] [&>svg]:text-accent',
  todo: 'bg-[color-mix(in_oklab,var(--color-dept-bod)_18%,var(--sys-color-surface))] text-text-1 border-dept-bod/40 shadow-[0_0_16px_color-mix(in_oklab,var(--color-dept-bod)_22%,transparent)] [&>svg]:text-dept-bod',
  'in-progress': 'bg-info-container text-on-info-container border-info/40 shadow-[0_0_18px_color-mix(in_oklab,var(--status-info)_24%,transparent)] [&>svg]:text-info',
  review: 'bg-warning-container text-on-warning-container border-warning/40 shadow-[0_0_18px_color-mix(in_oklab,var(--status-warning)_24%,transparent)] [&>svg]:text-warning',
  'design-review': 'bg-[color-mix(in_oklab,var(--color-dept-bod)_20%,var(--sys-color-surface))] text-text-1 border-dept-bod/45 shadow-[0_0_18px_color-mix(in_oklab,var(--color-dept-bod)_26%,transparent)] [&>svg]:text-dept-bod',
  rework: 'bg-error-container text-on-error-container border-error/38 shadow-[0_0_18px_color-mix(in_oklab,var(--status-error)_22%,transparent)] [&>svg]:text-error',
  done: 'bg-success-container text-on-success-container border-success/40 shadow-[0_0_18px_color-mix(in_oklab,var(--status-success)_24%,transparent)] [&>svg]:text-success',
  'not-started': 'bg-[color-mix(in_oklab,var(--color-dept-media)_18%,var(--sys-color-surface))] text-text-1 border-dept-media/40 shadow-[0_0_16px_color-mix(in_oklab,var(--color-dept-media)_22%,transparent)] [&>svg]:text-dept-media',
  blocked: 'bg-error-container text-on-error-container border-error/40 shadow-[0_0_18px_color-mix(in_oklab,var(--status-error)_24%,transparent)] [&>svg]:text-error',
  'on-hold': 'bg-info-container text-on-info-container border-info/36 shadow-[0_0_16px_color-mix(in_oklab,var(--status-info)_20%,transparent)] [&>svg]:text-info',
  archived: 'bg-[color-mix(in_oklab,var(--sys-color-text-muted)_18%,var(--sys-color-surface))] text-text-2 border-border-strong shadow-[0_0_14px_color-mix(in_oklab,var(--sys-color-text-muted)_18%,transparent)] [&>svg]:text-text-muted',
};

const variantSolid: Record<BadgeVariant, string> = {
  success: 'bg-success text-on-success border-success [&>svg]:text-on-success',
  warning: 'bg-warning text-on-warning border-warning [&>svg]:text-on-warning',
  error: 'bg-error text-on-error border-error [&>svg]:text-on-error',
  info: 'bg-info text-on-info border-info [&>svg]:text-on-info',
  neutral: 'bg-text-muted text-bg border-text-muted [&>svg]:text-bg',
  primary: 'bg-accent text-on-primary border-accent [&>svg]:text-on-primary',
  todo: 'bg-dept-bod text-on-primary border-dept-bod [&>svg]:text-on-primary',
  'in-progress': 'bg-info text-on-info border-info [&>svg]:text-on-info',
  review: 'bg-warning text-on-warning border-warning [&>svg]:text-on-warning',
  'design-review': 'bg-dept-bod text-on-primary border-dept-bod [&>svg]:text-on-primary',
  rework: 'bg-error text-on-error border-error [&>svg]:text-on-error',
  done: 'bg-success text-on-success border-success [&>svg]:text-on-success',
  'not-started': 'bg-dept-media text-on-primary border-dept-media [&>svg]:text-on-primary',
  blocked: 'bg-error text-on-error border-error [&>svg]:text-on-error',
  'on-hold': 'bg-info text-on-info border-info [&>svg]:text-on-info',
  archived: 'bg-text-muted text-bg border-text-muted [&>svg]:text-bg',
};

const defaultIcons: Partial<Record<BadgeVariant, ReactNode>> = {
  success: <CheckCircle2 />,
  warning: <ClipboardList />,
  error: <Ban />,
  info: <Circle />,
  primary: <Circle />,
  todo: <PlusCircle />,
  'in-progress': <CircleDashed />,
  review: <ClipboardList />,
  'design-review': <Shapes />,
  rework: <RotateCcw />,
  done: <CheckCircle2 />,
  'not-started': <MinusCircle />,
  blocked: <Ban />,
  'on-hold': <PauseCircle />,
  archived: <Clock3 />,
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'min-h-6 px-2.5 text-[11px] gap-1.5 [&>svg]:size-3.5',
  md: 'min-h-7 px-3 text-xs gap-2 [&>svg]:size-4',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', size = 'sm', soft = true, iconLeft, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-chip border font-bold whitespace-nowrap backdrop-blur-sm transition-colors duration-fast ease-standard',
        soft ? variantSoft[variant] : variantSolid[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {iconLeft ?? defaultIcons[variant]}
      {children}
    </span>
  ),
);

Badge.displayName = 'Badge';
