import { memo } from 'react';
import { BarChart3 } from 'lucide-react';
import { Button } from '../button';

interface ChartEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function ChartEmptyStateImpl({
  title = 'No data available',
  description = 'Data will appear here once available.',
  actionLabel,
  onAction,
}: ChartEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center" role="status">
      <div className="rounded-card bg-surface-2 p-4">
        <BarChart3 className="size-8 text-text-muted" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-text-1">{title}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export const ChartEmptyState = memo(ChartEmptyStateImpl);
