import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'group relative isolate overflow-hidden border text-text-1 shadow-sm',
    'border-[var(--sys-button-primary-border)] bg-[image:var(--sys-button-primary-bg)]',
    'hover:border-accent/50 hover:shadow-[0_0_16px_var(--sys-color-accent-dim)] active:scale-[0.99] disabled:opacity-50',
    '[&>svg]:text-accent',
  ),
  secondary: 'border border-border bg-surface-2 text-text-1 hover:border-border-strong hover:bg-surface-3 disabled:opacity-50',
  ghost: 'border border-transparent bg-transparent text-text-2 hover:bg-surface-2 hover:text-text-1 disabled:opacity-50',
  destructive: 'border border-error/30 bg-error-container text-on-error-container hover:border-error/50 disabled:opacity-50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3 text-xs gap-1.5 [&>svg]:size-3.5',
  md: 'min-h-10 px-5 text-sm gap-2 [&>svg]:size-4',
  lg: 'min-h-12 px-6 text-base gap-2.5 [&>svg]:size-5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-button font-bold transition-all duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/35 disabled:cursor-not-allowed motion-reduce:transition-none motion-reduce:hover:translate-y-0',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? <SpinnerInline /> : <>{iconLeft}{children}{iconRight}</>}
      </button>
    );
  },
);

Button.displayName = 'Button';

function SpinnerInline() {
  return <span role="status" aria-label="Loading" className="relative z-10 inline-block size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />;
}
