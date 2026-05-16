import { memo } from 'react';

interface ChartLoadingStateProps {
  barCount?: number;
}

function ChartLoadingStateImpl({ barCount = 7 }: ChartLoadingStateProps) {
  return (
    <div className="flex h-48 items-end justify-around gap-2 px-4 py-8" role="status" aria-label="Loading chart">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="w-8 animate-pulse rounded-t bg-surface-2"
          style={{ height: `${30 + Math.random() * 50}%`, animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

export const ChartLoadingState = memo(ChartLoadingStateImpl);
