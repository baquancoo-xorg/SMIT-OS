import { memo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../button';

interface ChartErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

function ChartErrorStateImpl({
  message = 'Failed to load chart data',
  onRetry,
}: ChartErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center" role="alert">
      <div className="rounded-card bg-error-container p-4">
        <AlertTriangle className="size-8 text-error" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-text-1">Chart Error</p>
        <p className="text-xs text-text-muted">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" iconLeft={<RefreshCw />} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export const ChartErrorState = memo(ChartErrorStateImpl);
