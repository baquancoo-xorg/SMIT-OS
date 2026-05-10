import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

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

// Variant → Tailwind classes (driven by design tokens)
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/95 disabled:bg-primary/40',
  secondary:
    'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 active:bg-secondary-container/90 disabled:bg-secondary-container/40',
  ghost:
    'bg-transparent text-on-surface hover:bg-surface-container active:bg-surface-container-high disabled:text-on-surface/40',
  destructive:
    'bg-error text-on-error hover:bg-error/90 active:bg-error/95 disabled:bg-error/40',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[length:var(--text-body-sm)] gap-1.5',
  md: 'h-10 px-5 text-[length:var(--text-body)] gap-2',
  lg: 'h-12 px-6 text-[length:var(--text-body-lg)] gap-2',
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: '[&>svg]:size-3.5',
  md: '[&>svg]:size-4',
  lg: '[&>svg]:size-5',
};

/**
 * Button v2 — Phase 4 component library.
 *
 * Token-driven: pill radius, semantic colors, focus-visible ring inherits global a11y rule.
 * No motion library dep — uses CSS transitions for reduced-motion friendliness.
 *
 * @example
 * <Button variant="primary" size="md" iconLeft={<PlusIcon />}>Add Objective</Button>
 */
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
      className = '',
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
        className={[
          'inline-flex items-center justify-center font-semibold rounded-button',
          'transition-colors motion-fast ease-standard',
          'focus-visible:outline-none', // global :focus-visible rule applies
          'disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          iconSizeStyles[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {isLoading ? (
          <SpinnerInline />
        ) : (
          <>
            {iconLeft}
            {children}
            {iconRight}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

// Inline lightweight spinner (avoid circular import with Spinner atom)
function SpinnerInline() {
  return (
    <span
      role="status"
      aria-label="Loading"
      className="inline-block size-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
    />
  );
}
