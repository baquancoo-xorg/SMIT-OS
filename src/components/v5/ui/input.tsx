import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export type InputSize = 'sm' | 'md';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  containerClassName?: string;
  /** 'sm' = h-8 + text-body-sm (match DateRangePicker). 'md' = h-10 + text-body (default). */
  size?: InputSize;
}

const SIZE_CLASSES: Record<InputSize, { input: string; padLeft: string; padRight: string }> = {
  sm: {
    input: 'h-8 px-3 text-[length:var(--text-body-sm)]',
    padLeft: 'pl-8',
    padRight: 'pr-8',
  },
  md: {
    input: 'h-10 px-3 text-[length:var(--text-body)]',
    padLeft: 'pl-10',
    padRight: 'pr-10',
  },
};

const ICON_INSET: Record<InputSize, { left: string; right: string }> = {
  sm: { left: 'left-2.5 [&>svg]:size-3.5', right: 'right-2.5 [&>svg]:size-3.5' },
  md: { left: 'left-3 [&>svg]:size-4', right: 'right-3 [&>svg]:size-4' },
};

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
      size = 'md',
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
            <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-on-surface-variant ${ICON_INSET[size].left}`}>
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
              'w-full rounded-input border bg-surface-container-lowest text-on-surface',
              SIZE_CLASSES[size].input,
              'transition-colors motion-fast ease-standard',
              'placeholder:text-on-surface-variant/60',
              'focus-visible:outline-none focus-visible:border-primary',
              'disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface/50',
              hasError ? 'border-error' : 'border-outline-variant hover:border-outline',
              iconLeft ? SIZE_CLASSES[size].padLeft : '',
              iconRight ? SIZE_CLASSES[size].padRight : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {iconRight && (
            <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-on-surface-variant ${ICON_INSET[size].right}`}>
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
