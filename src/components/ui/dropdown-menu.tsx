import { Menu, MenuButton, MenuItems, MenuItem, MenuSeparator } from '@headlessui/react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  /** Mark as destructive (red text). Use for delete / remove actions. */
  destructive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  /** When set, renders as a link (anchor) instead of a button. */
  href?: string;
  /** Insert a separator AFTER this item. */
  trailingSeparator?: boolean;
}

export interface DropdownMenuProps {
  /** Trigger node — typically a Button. */
  trigger: ReactNode;
  items: DropdownMenuItem[];
  /** ARIA label for the menu (required when trigger has no text). */
  label?: string;
  /** Anchor position. Default: 'bottom end'. */
  anchor?: 'top start' | 'top end' | 'bottom start' | 'bottom end';
  /** Width of the menu panel in rem. Default: '12rem'. */
  width?: string;
}

/**
 * DropdownMenu v2 — Headless UI Menu wrapper.
 *
 * Keyboard: Up/Down navigate, Enter activate, ESC close.
 * `destructive` items render in error color. `trailingSeparator` inserts visual divider.
 *
 * @example
 * <DropdownMenu
 *   trigger={<Button variant="ghost">Actions</Button>}
 *   items={[
 *     { key: 'edit', label: 'Edit', icon: <Pencil />, onClick: handleEdit },
 *     { key: 'duplicate', label: 'Duplicate', onClick: handleDup, trailingSeparator: true },
 *     { key: 'delete', label: 'Delete', icon: <Trash2 />, destructive: true, onClick: handleDel },
 *   ]}
 * />
 */
export function DropdownMenu({
  trigger,
  items,
  label,
  anchor = 'bottom end',
  width = '12rem',
}: DropdownMenuProps) {
  return (
    <Menu as="div" className="relative inline-block">
      <MenuButton as="div" aria-label={label} className="contents">
        {trigger}
      </MenuButton>

      <MenuItems
        anchor={{ to: anchor, gap: 6 }}
        style={{ width }}
        className={[
          'z-dropdown overflow-hidden rounded-card border border-outline-variant bg-surface shadow-elevated',
          'p-1 focus-visible:outline-none',
          'data-closed:opacity-0 data-closed:scale-95 transition motion-fast ease-standard',
        ].join(' ')}
      >
        {items.map((item) => (
          <span key={item.key} className="contents">
            <MenuItem disabled={item.disabled}>
              {({ focus, disabled }) => {
                const Tag = item.href ? 'a' : 'button';
                return (
                  <Tag
                    href={item.href}
                    type={item.href ? undefined : 'button'}
                    onClick={item.onClick}
                    aria-disabled={disabled || undefined}
                    className={[
                      'flex w-full items-center gap-2 rounded-button px-2.5 py-1.5 text-left text-[length:var(--text-body-sm)]',
                      'transition-colors motion-fast ease-standard',
                      '[&>svg]:size-4',
                      disabled
                        ? 'cursor-not-allowed text-on-surface/40'
                        : item.destructive
                        ? focus
                          ? 'bg-error-container text-on-error-container'
                          : 'text-error'
                        : focus
                        ? 'bg-surface-container text-on-surface'
                        : 'text-on-surface',
                    ].join(' ')}
                  >
                    {item.icon}
                    <span className="flex-1 truncate">{item.label}</span>
                  </Tag>
                );
              }}
            </MenuItem>
            {item.trailingSeparator && <MenuSeparator className="my-1 h-px bg-outline-variant/50" />}
          </span>
        ))}
      </MenuItems>
    </Menu>
  );
}

DropdownMenu.displayName = 'DropdownMenu';

/**
 * Convenience trigger button matching the v2 design — chevron-only "more" trigger.
 * Use when you don't need a labeled trigger.
 */
export function DropdownTriggerChevron({ label = 'Open menu' }: { label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container focus-visible:outline-none"
    >
      <ChevronDown aria-hidden="true" className="size-4" />
    </button>
  );
}
