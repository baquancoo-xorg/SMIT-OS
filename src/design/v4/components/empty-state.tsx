import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Icon or illustration above the title. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Action slot (e.g. <Button>Create first item</Button>). */
  action?: ReactNode;
  /** Vertical padding density. Default md. */
  density?: 'compact' | 'md' | 'spacious';
}

const densityClass = {
  compact: 'py-comfy',
  md: 'py-vast',
  spacious: 'py-huge',
} as const;

/**
 * v4 EmptyState — used when a list/table has no data.
 *
 * @example
 *   <EmptyState icon={<InboxIcon />} title="No leads yet" description="Create your first lead to begin tracking." action={<Button>Create Lead</Button>} />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  density = 'md',
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center text-center px-comfy', densityClass[density], className)}
      {...rest}
    >
      {icon && (
        <div className="mb-cozy text-fg-faint inline-flex size-12 items-center justify-center rounded-pill bg-surface-overlay">
          {icon}
        </div>
      )}
      <h3 className="text-h6 font-semibold text-fg tracking-tight">{title}</h3>
      {description && <p className="mt-tight max-w-snug text-body-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-cozy">{action}</div>}
    </div>
  );
}
