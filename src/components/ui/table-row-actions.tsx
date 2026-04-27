import { Eye, Edit2, Trash2 } from 'lucide-react';

interface TableRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  size?: number;
  compact?: boolean;
  className?: string;
  buttonClassName?: string;
}

export function TableRowActions({
  onView,
  onEdit,
  onDelete,
  size = 14,
  compact = false,
  className = '',
  buttonClassName = '',
}: TableRowActionsProps) {
  const paddingClass = compact ? 'p-1.5' : 'p-2';
  const wrapperClass = compact
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
          <Eye size={size} />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit"
          className={`${paddingClass} ${buttonClassName} text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all`}
        >
          <Edit2 size={size} />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete"
          className={`${paddingClass} ${buttonClassName} text-slate-400 hover:text-error hover:bg-error/5 rounded-lg transition-all`}
        >
          <Trash2 size={size} />
        </button>
      )}
    </div>
  );
}
