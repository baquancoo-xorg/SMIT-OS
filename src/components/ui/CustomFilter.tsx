import React, { Fragment } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FilterOption {
  value: string;
  label: string;
}

interface CustomFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
}

export default function CustomFilter({
  value,
  onChange,
  options,
  icon,
  className = '',
  buttonClassName = ''
}: CustomFilterProps) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className={`relative ${className}`}>
          <ListboxButton
            className={`
              flex items-center gap-2
              h-10 px-4 rounded-full
              bg-slate-50 border border-slate-200
              hover:bg-slate-100 hover:border-slate-300
              focus:border-primary focus:ring-2 focus:ring-primary/20
              outline-none transition-all cursor-pointer
              text-[10px] font-bold uppercase tracking-widest
              ${buttonClassName}
            `}
          >
            {icon && <span className="text-slate-400">{icon}</span>}
            <span className="text-slate-700">
              {selectedOption?.label || 'Select'}
            </span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
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
                anchor={{ to: 'bottom start', gap: 8 }}
                className="z-[200] min-w-[160px] bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden focus:outline-none"
              >
                {options.map((option) => (
                  <ListboxOption key={option.value} value={option.value} as={Fragment}>
                    {({ selected, focus }) => (
                      <div
                        className={`
                          flex items-center justify-between gap-3
                          px-4 py-2.5 cursor-pointer
                          text-sm font-medium transition-colors
                          ${focus ? 'bg-slate-50' : ''}
                          ${selected ? 'text-primary bg-primary/5' : 'text-slate-700'}
                        `}
                      >
                        <span>{option.label}</span>
                        {selected && <Check size={14} className="text-primary" />}
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
