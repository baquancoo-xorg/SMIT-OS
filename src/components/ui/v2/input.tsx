import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  containerClassName?: string;
}

/**
 * Input v2 — Phase 4 component library.
 *
 * Token-driven: rounded-input (16px), focus-visible ring, error state with semantic colors.
 * Auto-generates ID for label association if not provided.
 *
 * @example
 * <Input label="Email" type="email" placeholder="user@example.com" required />
 * <Input label="Username" error="Already taken" iconLeft={<UserIcon />} />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      iconLeft,
      iconRight,
      containerClassName = '',
      className = '',
      id,
      disabled,
      type = 'text',
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const inputId = id ?? reactId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const describedBy =
      [ariaDescribedBy, helperText && helperId, error && errorId].filter(Boolean).join(' ') || undefined;

    const hasError = Boolean(error);

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[length:var(--text-label)] font-medium text-on-surface-variant"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {iconLeft && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant [&>svg]:size-4">
              {iconLeft}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={[
              'h-10 w-full rounded-input border bg-surface-container-lowest px-3 text-[length:var(--text-body)] text-on-surface',
              'transition-colors motion-fast ease-standard',
              'placeholder:text-on-surface-variant/60',
              'focus-visible:outline-none focus-visible:border-primary',
              'disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface/50',
              hasError ? 'border-error' : 'border-outline-variant hover:border-outline',
              iconLeft ? 'pl-10' : '',
              iconRight ? 'pr-10' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {iconRight && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant [&>svg]:size-4">
              {iconRight}
            </span>
          )}
        </div>

        {error ? (
          <span id={errorId} role="alert" className="text-[length:var(--text-caption)] text-error">
            {error}
          </span>
        ) : helperText ? (
          <span id={helperId} className="text-[length:var(--text-caption)] text-on-surface-variant">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
