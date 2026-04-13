import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-on-surface-variant">{label}</label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={errorId}
          aria-invalid={!!error}
          className={`w-full px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline/30 text-on-surface
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            placeholder:text-on-surface-variant/50 ${error ? 'border-error' : ''} ${className}`}
          {...props}
        />
        {error && <p id={errorId} className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
