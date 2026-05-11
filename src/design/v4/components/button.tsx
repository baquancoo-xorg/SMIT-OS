import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon rendered before the label. Inherits accent color on primary. */
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Stretch to fill container width. */
  fullWidth?: boolean;
  /** Compound CTA: secondary label after a vertical orange divider. Primary only. */
  splitLabel?: ReactNode;
  children: ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-md text-body-sm gap-xs',
  md: 'h-11 px-lg text-body gap-sm',
  lg: 'h-12 px-xl text-body-lg gap-sm',
};

/**
 * v4 Button — primary uses signature DNA (dark gradient + orange beam from left).
 * Secondary = flat overlay. Ghost = transparent. Destructive = solid red (urgency).
 *
 * Primary supports `splitLabel` for compound CTAs like "Create | Lead Tracker".
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    fullWidth,
    splitLabel,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const base =
    'relative inline-flex items-center justify-center font-semibold rounded-pill ' +
    'transition-[transform,box-shadow,border-color,background-color] duration-medium ease-emphasized ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ' +
    'overflow-hidden select-none';

  const variantClass: Record<ButtonVariant, string> = {
    // Signature DNA: gradient surface + orange-tinted border + radial beam via ::after
    primary: cn(
      'text-fg border border-[color-mix(in_srgb,var(--brand-500)_30%,transparent)]',
      'bg-[linear-gradient(90deg,var(--color-surface-elevated)_0%,var(--color-surface-overlay)_100%)]',
      'before:absolute before:inset-y-[-30%] before:left-0 before:w-[70%] before:-translate-x-[30%]',
      'before:bg-[radial-gradient(ellipse_at_left_center,color-mix(in_srgb,var(--brand-500)_55%,transparent)_0%,transparent_65%)]',
      'before:blur-[20px] before:pointer-events-none before:content-[""]',
      'hover:border-[color-mix(in_srgb,var(--brand-500)_60%,transparent)] hover:-translate-y-px hover:shadow-glow-sm',
      'active:translate-y-0',
    ),
    secondary: cn(
      'bg-surface-overlay text-fg border border-outline-subtle',
      'hover:bg-[color-mix(in_srgb,var(--neutral-700)_100%,transparent)] hover:border-outline',
    ),
    ghost: cn(
      'bg-transparent text-fg-muted border border-transparent',
      'hover:bg-surface-overlay hover:text-fg',
    ),
    destructive: cn(
      'bg-rework text-fg border border-transparent',
      'hover:bg-[color-mix(in_srgb,var(--raw-rework)_85%,black)]',
    ),
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        base,
        sizeClasses[size],
        variantClass[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {leftIcon && (
        <span
          aria-hidden="true"
          className={cn(
            'relative z-10 inline-flex shrink-0 items-center',
            variant === 'primary' && 'text-accent',
          )}
        >
          {leftIcon}
        </span>
      )}
      <span className="relative z-10">{children}</span>
      {splitLabel && variant === 'primary' && (
        <>
          <span
            aria-hidden="true"
            className="relative z-10 mx-xs h-5 w-px self-center bg-accent shadow-glow-sm"
          />
          <span className="relative z-10 text-fg-muted font-medium">{splitLabel}</span>
        </>
      )}
      {rightIcon && (
        <span aria-hidden="true" className="relative z-10 inline-flex shrink-0 items-center">
          {rightIcon}
        </span>
      )}
    </button>
  );
});
