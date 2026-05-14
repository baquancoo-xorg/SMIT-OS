import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonSplitLabel {
  action: ReactNode;
  object: ReactNode;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  splitLabel?: ButtonSplitLabel;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'relative isolate overflow-hidden border text-text-1 shadow-sm',
    'border-[var(--sys-button-primary-border)] bg-[image:var(--sys-button-primary-bg)]',
    'hover:border-accent/50 hover:shadow-[var(--sys-shadow-card),0_0_24px_var(--sys-color-accent-dim)] active:scale-[0.99] disabled:opacity-50',
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
      splitLabel,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;
    const hasSplitLabel = variant === 'primary' && splitLabel && !isLoading;

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
        {isLoading ? <SpinnerInline /> : hasSplitLabel ? (
          <SplitLabelContent iconLeft={iconLeft} iconRight={iconRight} splitLabel={splitLabel} />
        ) : (
          <>{iconLeft}{children ?? (splitLabel ? <>{splitLabel.action} {splitLabel.object}</> : null)}{iconRight}</>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

interface SplitLabelContentProps {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  splitLabel: ButtonSplitLabel;
}

function SplitLabelContent({ iconLeft, iconRight, splitLabel }: SplitLabelContentProps) {
  return (
    <>
      {iconLeft}
      <span className="relative z-20 inline-flex items-center gap-1">
        <span className="text-text-1">{splitLabel.action}</span>
        <span className="relative h-5 w-0.5 rounded-full bg-[linear-gradient(180deg,transparent,var(--sys-color-accent)_14%,var(--sys-color-accent)_86%,transparent)] md:h-6" aria-hidden="true" />
        <span className="relative z-10 text-text-1 [text-shadow:0_0_12px_color-mix(in_oklab,var(--sys-color-accent)_45%,transparent),0_0_28px_var(--sys-color-accent-dim)] motion-reduce:[text-shadow:none]">
          <span className="pointer-events-none absolute -left-0.5 -right-14 top-1/2 -z-10 h-16 -translate-y-1/2 bg-[conic-gradient(from_-22deg_at_0%_50%,transparent_0deg,color-mix(in_oklab,var(--sys-color-accent)_24%,transparent)_16deg,color-mix(in_oklab,var(--sys-color-accent)_14%,transparent)_32deg,transparent_58deg)] blur-xl motion-reduce:hidden" aria-hidden="true" />
          <span className="pointer-events-none absolute -left-0.5 -right-10 top-1/2 -z-10 h-10 -translate-y-1/2 bg-[radial-gradient(ellipse_at_left,color-mix(in_oklab,var(--sys-color-accent)_22%,transparent)_0%,color-mix(in_oklab,var(--sys-color-accent)_12%,transparent)_42%,transparent_76%)] blur-lg motion-reduce:hidden" aria-hidden="true" />
          {splitLabel.object}
        </span>
      </span>
      {iconRight}
    </>
  );
}

function SpinnerInline() {
  return <span role="status" aria-label="Loading" className="relative z-10 inline-block size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />;
}
