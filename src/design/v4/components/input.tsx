import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  /** Hint below the field. Hidden when `error` is set. */
  helper?: ReactNode;
  /** Validation error message. Overrides helper visibility. */
  error?: ReactNode;
  /** Icon rendered inside the field, left side. */
  leftIcon?: ReactNode;
  /** Icon rendered inside the field, right side. */
  rightIcon?: ReactNode;
  /** Field size. Default md. */
  fieldSize?: InputSize;
  /** Stretch to fill width. Default true. */
  fullWidth?: boolean;
  /** Pill-shape field (used for search). Default false → rounded-input. */
  pill?: boolean;
}

const sizeClass: Record<InputSize, string> = {
  sm: 'h-9 text-body-sm',
  md: 'h-11 text-body',
  lg: 'h-12 text-body-lg',
};

/**
 * v4 Input — text field with label + helper + error slots.
 *
 * @example
 *   <Input label="Email" type="email" required />
 *   <Input pill leftIcon={<SearchIcon />} placeholder="Search…" />
 *   <Input label="Token" error="Invalid format" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helper,
    error,
    leftIcon,
    rightIcon,
    fieldSize = 'md',
    fullWidth = true,
    pill = false,
    className,
    id,
    disabled,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? errorId : helper ? helperId : undefined;

  return (
    <div className={cn(fullWidth ? 'w-full' : 'w-auto')}>
      {label && (
        <label htmlFor={inputId} className="block mb-tight text-label font-medium text-fg-muted">
          {label}
        </label>
      )}
      <div
        className={cn(
          'group relative flex items-center',
          'bg-surface-overlay border transition-colors duration-fast',
          error ? 'border-error' : 'border-outline-subtle hover:border-outline',
          'focus-within:border-accent focus-within:shadow-focus',
          pill ? 'rounded-pill px-comfy' : 'rounded-input px-cozy',
          sizeClass[fieldSize],
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {leftIcon && (
          <span aria-hidden="true" className="mr-snug shrink-0 text-fg-subtle">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(
            'flex-1 bg-transparent outline-none placeholder:text-fg-faint text-fg',
            'disabled:cursor-not-allowed',
            className,
          )}
          {...rest}
        />
        {rightIcon && (
          <span aria-hidden="true" className="ml-snug shrink-0 text-fg-subtle">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <p id={errorId} className="mt-tight text-caption text-error">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="mt-tight text-caption text-fg-subtle">
          {helper}
        </p>
      ) : null}
    </div>
  );
});
