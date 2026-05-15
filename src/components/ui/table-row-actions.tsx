import { Eye, Edit2, Trash2 } from 'lucide-react';
import type { TableVariant } from './table-contract';
import { cn } from '@/lib/cn';

interface TableRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  size?: number;
  compact?: boolean;
  className?: string;
  buttonClassName?: string;
  variant?: TableVariant;
}

const actionButtonBase = cn(
  'rounded-chip border border-border bg-surface-2/70 text-on-surface-variant backdrop-blur-sm',
  'transition-all duration-fast ease-standard hover:border-accent/35 hover:bg-surface-3 hover:text-accent hover:shadow-[0_0_14px_var(--sys-color-accent-dim)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/35 motion-reduce:transition-none',
);

export function TableRowActions({
  onView,
  onEdit,
  onDelete,
  size = 14,
  compact = false,
  className = '',
  buttonClassName = '',
  variant = 'standard',
}: TableRowActionsProps) {
  const useCompact = compact || variant === 'dense';
  const iconSize = variant === 'dense' ? Math.min(size, 13) : size;
  const paddingClass = useCompact ? 'p-1.5' : 'p-2';
  const wrapperClass = useCompact
    ? `flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${className}`
    : `flex items-center justify-end gap-1 ${className}`;

  return (
    <div className={wrapperClass.trim()}>
      {onView && (
        <button
          type="button"
          onClick={onView}
          aria-label="View"
          className={cn(actionButtonBase, paddingClass, buttonClassName)}
        >
          <Eye size={iconSize} />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit"
          className={cn(actionButtonBase, paddingClass, buttonClassName)}
        >
          <Edit2 size={iconSize} />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete"
          className={cn(
            actionButtonBase,
            'hover:border-error/35 hover:bg-error-container hover:text-error hover:shadow-[0_0_14px_color-mix(in_oklab,var(--status-error)_18%,transparent)] focus-visible:ring-error/35',
            paddingClass,
            buttonClassName,
          )}
        >
          <Trash2 size={iconSize} />
        </button>
      )}
    </div>
  );
}
