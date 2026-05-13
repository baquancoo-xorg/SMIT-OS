import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '../../../lib/cn';

export type KpiTrend = 'up' | 'down' | 'flat';
export type KpiAccent = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface KpiCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  deltaPercent?: number;
  deltaLabel?: string;
  trend?: KpiTrend;
  accent?: KpiAccent;
  decorative?: boolean;
  loading?: boolean;
  sparkline?: ReactNode;
}

const accentBlobStyle: Record<KpiAccent, string> = {
  primary: 'bg-accent-dim',
  success: 'bg-success-container/60',
  warning: 'bg-warning-container/60',
  error: 'bg-error-container/60',
  info: 'bg-info-container/60',
};

const trendStyle: Record<KpiTrend, string> = {
  up: 'text-success bg-success-container',
  down: 'text-error bg-error-container',
  flat: 'text-text-muted bg-surface-2',
};

const trendIcon: Record<KpiTrend, ReactNode> = {
  up: <ArrowUpRight aria-hidden="true" />,
  down: <ArrowDownRight aria-hidden="true" />,
  flat: <Minus aria-hidden="true" />,
};

function inferTrend(deltaPercent: number | undefined): KpiTrend {
  if (deltaPercent === undefined || deltaPercent === 0) return 'flat';
  return deltaPercent > 0 ? 'up' : 'down';
}

export const KpiCard = forwardRef<HTMLDivElement, KpiCardProps>(
  (
    {
      label,
      value,
      unit,
      icon,
      deltaPercent,
      deltaLabel,
      trend: trendProp,
      accent = 'primary',
      decorative = true,
      loading = false,
      sparkline,
      className,
      ...props
    },
    ref,
  ) => {
    const trend = trendProp ?? inferTrend(deltaPercent);
    const formattedDelta = deltaPercent !== undefined ? `${deltaPercent > 0 ? '+' : ''}${deltaPercent.toFixed(1)}%` : null;

    return (
      <div
        ref={ref}
        aria-busy={loading || undefined}
        className={cn(
          'group relative overflow-hidden rounded-card border border-border bg-surface p-[var(--density-space)] shadow-lg transition-all duration-medium ease-standard',
          'hover:-translate-y-px hover:border-accent/25 hover:shadow-glass',
          loading && 'opacity-60',
          className,
        )}
        {...props}
      >
        {decorative && <div aria-hidden="true" className={cn('pointer-events-none absolute -right-14 -top-14 size-40 rounded-full blur-3xl opacity-0 transition-opacity group-hover:opacity-60', accentBlobStyle[accent])} />}
        <div className="relative flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">{label}</span>
            {icon && <span className="text-accent-text [&>svg]:size-5">{icon}</span>}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline text-4xl font-black leading-none tracking-tight text-text-1">{value}</span>
            {unit && <span className="text-sm font-bold text-text-muted">{unit}</span>}
          </div>
          {sparkline}
          {formattedDelta && (
            <div className="flex items-center gap-2">
              <span className={cn('inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-xs font-bold [&>svg]:size-3', trendStyle[trend])}>
                {trendIcon[trend]}
                {formattedDelta}
              </span>
              {deltaLabel && <span className="text-xs font-medium text-text-muted">{deltaLabel}</span>}
            </div>
          )}
        </div>
      </div>
    );
  },
);

KpiCard.displayName = 'KpiCard';
