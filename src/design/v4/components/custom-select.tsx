import { useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { useClickOutside } from '../primitives/use-click-outside';
import { useEscapeKey } from '../primitives/use-escape-key';
import { useKeyboardListNav } from '../primitives/use-keyboard-list-nav';

export interface CustomSelectOption<V extends string = string> {
  value: V;
  label: ReactNode;
  /** Optional left icon. */
  icon?: ReactNode;
  /** Optional right meta (e.g. count, status dot). */
  meta?: ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps<V extends string = string> {
  value: V | null;
  onChange: (next: V) => void;
  options: CustomSelectOption<V>[];
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  fullWidth?: boolean;
  className?: string;
}

/**
 * v4 CustomSelect — portal-style dropdown with icons + meta per option. Keyboard nav included.
 * Use over native Select when option rows need rich content.
 */
export function CustomSelect<V extends string = string>({
  value,
  onChange,
  options,
  label,
  helper,
  error,
  placeholder = 'Select…',
  fullWidth = true,
  className,
}: CustomSelectProps<V>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  useClickOutside(containerRef, () => setOpen(false), open);
  useEscapeKey(() => setOpen(false), open);

  const { activeIndex, setActiveIndex, onKeyDown } = useKeyboardListNav({
    count: options.length,
    enabled: open,
    onSelect: (i) => {
      const opt = options[i];
      if (!opt || opt.disabled) return;
      onChange(opt.value);
      setOpen(false);
    },
  });

  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <div ref={containerRef} className={cn('relative', fullWidth ? 'w-full' : 'inline-block', className)}>
      {label && (
        <label htmlFor={reactId} className="block mb-xs text-label font-medium text-fg-muted">
          {label}
        </label>
      )}
      <button
        type="button"
        id={reactId}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between gap-sm h-11 px-md text-body',
          'bg-surface-overlay border rounded-input transition-colors duration-fast',
          error ? 'border-error' : 'border-outline-subtle hover:border-outline',
          open && 'border-accent shadow-focus',
        )}
      >
        <span className={cn('flex items-center gap-sm min-w-0', selected ? 'text-fg' : 'text-fg-faint')}>
          {selected?.icon && <span aria-hidden="true">{selected.icon}</span>}
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </span>
        <span aria-hidden="true" className="text-fg-subtle">▾</span>
      </button>
      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          onKeyDown={onKeyDown}
          autoFocus
          className={cn(
            'absolute left-0 right-0 top-full mt-xs z-dropdown py-xs max-h-72 overflow-auto',
            'bg-surface-popover border border-outline-subtle rounded-input shadow-elevated',
            'focus:outline-none',
          )}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isActive = activeIndex === i;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-sm px-md py-sm text-body-sm text-left',
                  'transition-colors duration-fast disabled:opacity-40',
                  isSelected ? 'text-accent' : 'text-fg-muted',
                  isActive && !opt.disabled && 'bg-surface-overlay text-fg',
                )}
              >
                {opt.icon && <span aria-hidden="true" className="shrink-0">{opt.icon}</span>}
                <span className="flex-1 truncate">{opt.label}</span>
                {opt.meta && <span className="text-caption text-fg-subtle">{opt.meta}</span>}
                {isSelected && <span aria-hidden="true" className="text-accent">✓</span>}
              </button>
            );
          })}
        </div>
      )}
      {error ? <p className="mt-xs text-caption text-error">{error}</p> : helper ? <p className="mt-xs text-caption text-fg-subtle">{helper}</p> : null}
    </div>
  );
}
