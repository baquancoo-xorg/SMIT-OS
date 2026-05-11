import type { ReactNode } from 'react';
import { DropdownMenu, type DropdownMenuItem } from './dropdown-menu';
import { cn } from '../lib/cn';

export interface TableRowActionsProps {
  items: DropdownMenuItem[];
  /** Optional icon for the trigger button. Default vertical ellipsis "⋮". */
  triggerIcon?: ReactNode;
  /** Visible label for screen readers. Default "Row actions". */
  label?: string;
  className?: string;
}

/**
 * v4 TableRowActions — icon-button → dropdown menu. Used in last column of data-table.
 *
 * @example
 *   <TableRowActions items={[
 *     { key:'edit', label:'Edit', onSelect: edit },
 *     { key:'del', label:'Delete', danger:true, onSelect: del },
 *   ]} />
 */
export function TableRowActions({ items, triggerIcon = '⋮', label = 'Row actions', className }: TableRowActionsProps) {
  return (
    <DropdownMenu
      align="bottom-end"
      items={items}
      className={className}
      trigger={
        <button
          type="button"
          aria-label={label}
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-pill',
            'text-fg-muted hover:text-fg hover:bg-surface-overlay transition-colors duration-fast',
          )}
        >
          <span aria-hidden="true" className="text-h6 leading-none">{triggerIcon}</span>
        </button>
      }
    />
  );
}
