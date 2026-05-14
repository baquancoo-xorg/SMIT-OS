// FilterChip v2 — single-select value-bound filter chip với dropdown.
// Replaces v1 CustomFilter. Pattern: chip trigger (current value label) + dropdown options + check mark.
//
// Difference vs DropdownMenu v2: DropdownMenu = action menu (callback per item).
// FilterChip = value selector (controlled value, onChange callback per selection).

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import type { ReactNode } from 'react';

export interface FilterChipOption<T extends string | number> {
  value: T;
  label: string;
}

export type FilterChipSize = 'sm' | 'md';

export interface FilterChipProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: FilterChipOption<T>[];
  /** Optional leading icon. Sized 14px to match chip pill height. */
  icon?: ReactNode;
  /** Fallback label khi value không match option nào. */
  placeholder?: string;
  /** ARIA label cho screen readers. Recommend khi không có visible label nearby. */
  label?: string;
  /** Size: 'md' (default) = uppercase caption pill / 'sm' = compact normal-case body cho table density. */
  size?: FilterChipSize;
  className?: string;
  disabled?: boolean;
}

const SIZE_CLASSES: Record<FilterChipSize, string> = {
  md: 'h-10 px-4 text-[length:var(--text-caption)] uppercase tracking-[var(--tracking-wide)]',
  sm: 'h-8 px-3 text-[length:var(--text-body-sm)] normal-case',
};

export function FilterChip<T extends string | number>({
  value,
  onChange,
  options,
  icon,
  placeholder = 'Select',
  label,
  size = 'md',
  className = '',
  disabled = false,
}: FilterChipProps<T>) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className={`relative ${className}`}>
          <ListboxButton
            aria-label={label}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-chip border border-outline-variant/40 bg-surface font-semibold text-on-surface-variant outline-none transition-colors hover:bg-surface-variant/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-50 ${SIZE_CLASSES[size]}`}
          >
            {icon && <span className="text-on-surface-variant">{icon}</span>}
            <span className="text-on-surface">{selectedOption?.label ?? placeholder}</span>
            <ChevronDown
              size={14}
              className={`text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </ListboxButton>

          <ListboxOptions
            anchor={{ to: 'bottom start', gap: 8 }}
            transition
            className="z-[200] min-w-[160px] overflow-hidden rounded-card border border-outline-variant/40 bg-surface shadow-elevated transition duration-150 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {options.map((option) => (
              <ListboxOption
                key={String(option.value)}
                value={option.value}
                className="cursor-pointer transition-colors data-[focus]:bg-surface-variant/40"
              >
                {({ selected }) => (
                  <div
                    className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-[length:var(--text-body-sm)] font-medium transition-colors ${
                      selected ? 'bg-primary/5 text-primary' : 'text-on-surface'
                    }`}
                  >
                    <span>{option.label}</span>
                    {selected && <Check size={14} className="text-primary" />}
                  </div>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      )}
    </Listbox>
  );
}
