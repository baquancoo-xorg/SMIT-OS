import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  /** Override input field size. Default md. */
  fieldSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeClass = {
  sm: 'h-9 text-body-sm',
  md: 'h-11 text-body',
  lg: 'h-12 text-body-lg',
} as const;

/**
 * v4 DatePicker — wraps native `<input type="date">` with v4 styling.
 * Browser provides calendar popup. For range, see DateRangePicker.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { label, helper, error, fieldSize = 'md', fullWidth = true, className, id, disabled, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const describedBy = error ? errorId : helper ? helperId : undefined;

  return (
    <div className={cn(fullWidth ? 'w-full' : 'inline-block')}>
      {label && (
        <label htmlFor={inputId} className="block mb-tight text-label font-medium text-fg-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type="date"
        id={inputId}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full bg-surface-overlay text-fg px-cozy rounded-input border outline-none transition-colors duration-fast',
          error ? 'border-error' : 'border-outline-subtle hover:border-outline',
          'focus:border-accent focus:shadow-focus',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          '[color-scheme:dark]',
          sizeClass[fieldSize],
          className,
        )}
        {...rest}
      />
      {error ? <p id={errorId} className="mt-tight text-caption text-error">{error}</p> : helper ? <p id={helperId} className="mt-tight text-caption text-fg-subtle">{helper}</p> : null}
    </div>
  );
});
