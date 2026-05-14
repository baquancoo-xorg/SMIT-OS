import React, { Fragment } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  iconColor?: string;
}

interface CustomSelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect<T = string>({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  icon,
  className = '',
  disabled = false
}: CustomSelectProps<T>) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className={`relative ${className}`}>
          <ListboxButton
            className={`
              flex w-full items-center justify-between gap-2
              rounded-card border border-outline-variant/40 bg-surface px-4 py-3
              text-[length:var(--text-body-sm)] font-medium
              outline-none transition-colors
              hover:border-outline focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/35
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <span className="flex items-center gap-2 truncate">
              {icon && <span className="flex-shrink-0 text-primary">{icon}</span>}
              {selectedOption?.icon && (
                <span className={`flex-shrink-0 ${selectedOption.iconColor || ''}`}>
                  {selectedOption.icon}
                </span>
              )}
              <span className={selectedOption ? 'text-on-surface' : 'text-on-surface-variant/70'}>
                {selectedOption?.label || placeholder}
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`flex-shrink-0 text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </ListboxButton>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
              >
              <ListboxOptions
                static
                className="absolute z-50 mt-2 max-h-60 w-full overflow-hidden overflow-y-auto rounded-card border border-outline-variant/40 bg-surface shadow-elevated"
              >
                {options.map((option) => (
                  <ListboxOption key={String(option.value)} value={option.value} as={Fragment}>
                    {({ selected, focus }) => (
                      <div
                        className={`
                          flex cursor-pointer items-center justify-between gap-2
                          px-4 py-2.5 text-[length:var(--text-body-sm)] font-medium transition-colors
                          ${focus ? 'bg-surface-variant/40' : ''}
                          ${selected ? 'bg-primary/5 text-primary' : 'text-on-surface'}
                        `}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {option.icon && (
                            <span className={`flex-shrink-0 ${option.iconColor || ''}`}>
                              {option.icon}
                            </span>
                          )}
                          <span>{option.label}</span>
                        </span>
                        {selected && <Check size={16} className="text-primary flex-shrink-0" />}
                      </div>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Listbox>
  );
}
