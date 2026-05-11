import type { ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';
import { DropdownMenu, type DropdownMenuItem } from './dropdown-menu';
import { cn } from '../lib/cn';

export interface TableRowActionsProps {
  items: DropdownMenuItem[];
  /** Optional icon for the trigger button. Default MoreVertical (⋮). */
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
export function TableRowActions({ items, triggerIcon, label = 'Row actions', className }: TableRowActionsProps) {
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
          {triggerIcon ?? <MoreVertical size={16} aria-hidden="true" />}
        </button>
      }
    />
  );
}
