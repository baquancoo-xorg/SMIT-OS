import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '../lib/cn';
import { SurfaceCard, type SurfaceCardProps } from './surface-card';

export type KpiTrend = 'up' | 'down' | 'flat';

export interface KpiCardProps extends Omit<SurfaceCardProps, 'children'> {
  label: ReactNode;
  value: ReactNode;
  /** Optional change indicator (e.g. "+8%"). */
  delta?: ReactNode;
  /** Direction of change — controls badge color. */
  trend?: KpiTrend;
  /** Optional icon at top-right. */
  icon?: ReactNode;
  /** Secondary metadata (e.g. comparison period). */
  meta?: ReactNode;
}

const trendClass: Record<KpiTrend, string> = {
  up:   'bg-done-soft text-done',
  down: 'bg-rework-soft text-rework',
  flat: 'bg-surface-overlay text-fg-muted',
};

const trendIcon: Record<KpiTrend, typeof ArrowUp> = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
};

/**
 * v4 KpiCard — label + large value + delta badge. Built on SurfaceCard.
 *
 * @example
 *   <KpiCard label="Total Revenue" value="$19,270.56" delta="+8%" trend="up" meta="vs last month" />
 */
export function KpiCard({ label, value, delta, trend = 'up', icon, meta, className, padding = 'md', interactive = true, ...rest }: KpiCardProps) {
  return (
    <SurfaceCard padding={padding} interactive={interactive} className={cn('flex flex-col gap-tight', className)} {...rest}>
      <div className="flex items-start justify-between gap-cozy">
        <p className="text-body-sm text-fg-muted">{label}</p>
        {icon && <span aria-hidden="true" className="text-fg-subtle">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-snug">
        <span className="text-h3 font-semibold tracking-tight text-fg">{value}</span>
        {delta && (() => {
          const TrendIcon = trendIcon[trend];
          return (
            <span className={cn('inline-flex items-center gap-tight rounded-pill px-snug py-tight text-caption font-semibold', trendClass[trend])}>
              <TrendIcon size={12} aria-hidden="true" />
              {delta}
            </span>
          );
        })()}
      </div>
      {meta && <p className="text-caption text-fg-subtle">{meta}</p>}
    </SurfaceCard>
  );
}
