import type { ReactNode } from 'react';
import { Card } from '../card';
import { ChartEmptyState } from './chart-empty-state';
import { ChartLoadingState } from './chart-loading-state';
import { ChartErrorState } from './chart-error-state';

export type ChartState = 'ready' | 'empty' | 'loading' | 'error';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  state?: ChartState;
  legend?: ReactNode;
  actions?: ReactNode;
  emptyProps?: { title?: string; description?: string; actionLabel?: string; onAction?: () => void };
  errorProps?: { message?: string; onRetry?: () => void };
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  state = 'ready',
  legend,
  actions,
  emptyProps,
  errorProps,
  children,
  className = '',
}: ChartCardProps) {
  return (
    <Card padding="md" glow className={className}>
      <figure className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <figcaption className="text-sm font-bold text-text-1">{title}</figcaption>
            {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {legend}
            {actions}
          </div>
        </div>

        {state === 'loading' && <ChartLoadingState />}
        {state === 'empty' && <ChartEmptyState {...emptyProps} />}
        {state === 'error' && <ChartErrorState {...errorProps} />}
        {state === 'ready' && children}
      </figure>
    </Card>
  );
}
