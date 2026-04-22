import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-white/50 backdrop-blur-sm 
            border border-white/30 rounded-xl px-4 py-2.5 
            text-sm text-on-surface placeholder:text-slate-400
            outline-none transition-all duration-200
            focus:ring-2 focus:ring-primary/20 focus:border-primary/40
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error/50 focus:ring-error/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-[10px] font-bold text-error px-1">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-[10px] font-bold text-slate-400 px-1">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
