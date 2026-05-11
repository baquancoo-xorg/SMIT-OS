import { useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { useClickOutside } from '../primitives/use-click-outside';
import { useEscapeKey } from '../primitives/use-escape-key';
import { useKeyboardListNav } from '../primitives/use-keyboard-list-nav';

export interface DropdownMenuItem {
  /** Unique key per item. */
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Marks item as destructive (red text). */
  danger?: boolean;
  onSelect: () => void;
}

export interface DropdownMenuProps {
  /** Trigger element. Renders inside a wrapper that controls open state. */
  trigger: ReactNode;
  items: DropdownMenuItem[];
  /** Anchor side. Default 'bottom-end'. */
  align?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** Optional header label inside the menu. */
  label?: ReactNode;
  className?: string;
}

const alignClass: Record<NonNullable<DropdownMenuProps['align']>, string> = {
  'bottom-start': 'top-full left-0 mt-tight',
  'bottom-end': 'top-full right-0 mt-tight',
  'top-start': 'bottom-full left-0 mb-tight',
  'top-end': 'bottom-full right-0 mb-tight',
};

/**
 * v4 DropdownMenu — anchored popover with keyboard nav (ArrowUp/Down, Home/End, Enter/Space, Escape).
 *
 * @example
 *   <DropdownMenu
 *     trigger={<Button variant="secondary">Actions</Button>}
 *     items={[
 *       { key: 'edit', label: 'Edit', onSelect: doEdit },
 *       { key: 'del', label: 'Delete', danger: true, onSelect: doDelete },
 *     ]}
 *   />
 */
export function DropdownMenu({ trigger, items, align = 'bottom-end', label, className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);
  useEscapeKey(() => setOpen(false), open);

  const { activeIndex, setActiveIndex, onKeyDown } = useKeyboardListNav({
    count: items.length,
    enabled: open,
    onSelect: (i) => {
      const item = items[i];
      if (!item || item.disabled) return;
      item.onSelect();
      setOpen(false);
    },
  });

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <div
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className={cn(
            'absolute z-dropdown min-w-[12rem] py-tight',
            'bg-surface-popover border border-outline-subtle rounded-input shadow-elevated',
            'focus:outline-none',
            alignClass[align],
          )}
          autoFocus
        >
          {label && (
            <div className="px-cozy py-tight text-caption font-medium uppercase tracking-widest text-fg-subtle">
              {label}
            </div>
          )}
          {items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => {
                if (item.disabled) return;
                item.onSelect();
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-snug px-cozy py-snug text-body-sm text-left',
                'transition-colors duration-fast',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                item.danger ? 'text-error' : 'text-fg-muted',
                !item.disabled && activeIndex === i && (item.danger ? 'bg-error-soft text-error' : 'bg-surface-overlay text-fg'),
              )}
            >
              {item.icon && (
                <span aria-hidden="true" className="inline-flex shrink-0">
                  {item.icon}
                </span>
              )}
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
