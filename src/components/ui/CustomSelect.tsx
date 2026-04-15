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
              w-full flex items-center justify-between gap-2
              px-4 py-3 rounded-3xl
              bg-white border border-slate-200
              hover:border-slate-300
              focus:border-primary focus:ring-2 focus:ring-primary/20
              outline-none transition-all
              text-sm font-medium
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="flex items-center gap-2 truncate">
              {icon && <span className="text-primary flex-shrink-0">{icon}</span>}
              {selectedOption?.icon && (
                <span className={`flex-shrink-0 ${selectedOption.iconColor || ''}`}>
                  {selectedOption.icon}
                </span>
              )}
              <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
                {selectedOption?.label || placeholder}
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
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
                className="absolute z-50 w-full mt-2 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto"
              >
                {options.map((option) => (
                  <ListboxOption key={String(option.value)} value={option.value} as={Fragment}>
                    {({ selected, focus }) => (
                      <div
                        className={`
                          flex items-center justify-between gap-2
                          px-4 py-2.5 cursor-pointer
                          text-sm font-medium transition-colors
                          ${focus ? 'bg-slate-50' : ''}
                          ${selected ? 'text-primary bg-primary/5' : 'text-slate-700'}
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
