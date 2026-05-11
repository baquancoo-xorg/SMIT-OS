import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

export interface SelectOption<V extends string | number = string> {
  value: V;
  label: ReactNode;
  disabled?: boolean;
}

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps<V extends string | number = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'children'> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  options: SelectOption<V>[];
  /** Empty/placeholder option label. If set, prepends a disabled option with `value=""`. */
  placeholder?: string;
  fieldSize?: SelectSize;
  fullWidth?: boolean;
}

const sizeClass: Record<SelectSize, string> = {
  sm: 'h-9 text-body-sm',
  md: 'h-11 text-body',
  lg: 'h-12 text-body-lg',
};

/**
 * v4 Select — native `<select>` styled with v4 tokens. Use `CustomSelect` for portal-based custom rendering.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    helper,
    error,
    options,
    placeholder,
    fieldSize = 'md',
    fullWidth = true,
    className,
    id,
    disabled,
    value,
    defaultValue,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const selectId = id ?? reactId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  const describedBy = error ? errorId : helper ? helperId : undefined;

  return (
    <div className={cn(fullWidth ? 'w-full' : 'w-auto')}>
      {label && (
        <label htmlFor={selectId} className="block mb-tight text-label font-medium text-fg-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          value={value}
          defaultValue={defaultValue ?? (placeholder ? '' : undefined)}
          className={cn(
            'w-full appearance-none bg-surface-overlay text-fg',
            'border rounded-input pl-cozy pr-wide outline-none transition-colors duration-fast',
            error ? 'border-error' : 'border-outline-subtle hover:border-outline',
            'focus:border-accent focus:shadow-focus',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClass[fieldSize],
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-cozy top-1/2 -translate-y-1/2 text-fg-subtle" />
      </div>
      {error ? (
        <p id={errorId} className="mt-tight text-caption text-error">{error}</p>
      ) : helper ? (
        <p id={helperId} className="mt-tight text-caption text-fg-subtle">{helper}</p>
      ) : null}
    </div>
  );
});
