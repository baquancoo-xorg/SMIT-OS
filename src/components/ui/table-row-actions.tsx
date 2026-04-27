import { Eye, Edit2, Trash2 } from 'lucide-react';
import type { TableVariant } from './table-contract';

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
          className={`${paddingClass} ${buttonClassName} text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all`}
        >
          <Eye size={iconSize} />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit"
          className={`${paddingClass} ${buttonClassName} text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all`}
        >
          <Edit2 size={iconSize} />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete"
          className={`${paddingClass} ${buttonClassName} text-slate-400 hover:text-error hover:bg-error/5 rounded-lg transition-all`}
        >
          <Trash2 size={iconSize} />
        </button>
      )}
    </div>
  );
}
