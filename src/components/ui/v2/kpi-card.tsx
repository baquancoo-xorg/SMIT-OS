import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export type KpiTrend = 'up' | 'down' | 'flat';
export type KpiAccent = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface KpiCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  /** Sub-value rendered after main value (e.g., unit, currency suffix). */
  unit?: string;
  /** Optional icon shown top-right. Sized to 20px. */
  icon?: ReactNode;
  /** Delta value as percentage (e.g., 12.5 → "+12.5%"). Pass with `trend`. */
  deltaPercent?: number;
  /** Sub-label under delta (e.g., "vs last week"). */
  deltaLabel?: string;
  /** Trend direction. Auto-inferred from deltaPercent sign if omitted. */
  trend?: KpiTrend;
  /** Color theme for the decorative blob and accent. */
  accent?: KpiAccent;
  /** When true, renders the signature decorative blob (Bento pattern). */
  decorative?: boolean;
  /** When true, fills `aria-busy` and dims content (e.g., during refetch). */
  loading?: boolean;
}

const accentBlobStyle: Record<KpiAccent, string> = {
  primary: 'bg-primary-container/50',
  success: 'bg-success-container/50',
  warning: 'bg-warning-container/50',
  error: 'bg-error-container/50',
  info: 'bg-info-container/50',
};

const trendStyle: Record<KpiTrend, string> = {
  up: 'text-success bg-success-container',
  down: 'text-error bg-error-container',
  flat: 'text-on-surface-variant bg-surface-container',
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

/**
 * KpiCard v2 — Bento signature metric card.
 *
 * Phase 1 audit found only 1/8 pages had the Bento decorative blob.
 * This is the canonical metric block — use everywhere a "headline number" is shown.
 *
 * Hover effect uses vanilla CSS transition (no motion lib) — respects prefers-reduced-motion globally.
 *
 * @example
 * <KpiCard
 *   label="Total Leads"
 *   value="248"
 *   icon={<Users />}
 *   deltaPercent={12.5}
 *   deltaLabel="vs last week"
 *   accent="success"
 *   decorative
 * />
 */
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
      className = '',
      ...props
    },
    ref,
  ) => {
    const trend = trendProp ?? inferTrend(deltaPercent);
    const formattedDelta =
      deltaPercent !== undefined
        ? `${deltaPercent > 0 ? '+' : ''}${deltaPercent.toFixed(1)}%`
        : null;

    return (
      <div
        ref={ref}
        aria-busy={loading || undefined}
        className={[
          'group relative overflow-hidden rounded-card',
          'border border-outline-variant/40 bg-white/70 backdrop-blur-md',
          'p-5 transition-all motion-medium ease-standard',
          'hover:scale-[1.015] hover:shadow-md hover:border-outline-variant/70',
          loading ? 'opacity-60' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {decorative && (
          <div
            aria-hidden="true"
            className={[
              'pointer-events-none absolute -top-12 -right-12 size-40 rounded-full blur-3xl',
              'transition-opacity motion-medium ease-standard',
              'opacity-60 group-hover:opacity-90',
              accentBlobStyle[accent],
            ].join(' ')}
          />
        )}

        <div className="relative flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
              {label}
            </span>
            {icon && (
              <span className="text-on-surface-variant [&>svg]:size-5">
                {icon}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-headline text-[length:var(--text-h2)] font-bold leading-none text-on-surface tracking-[var(--tracking-tight)]">
              {value}
            </span>
            {unit && (
              <span className="text-[length:var(--text-body)] font-medium text-on-surface-variant">
                {unit}
              </span>
            )}
          </div>

          {formattedDelta && (
            <div className="flex items-center gap-2">
              <span
                className={[
                  'inline-flex items-center gap-0.5 rounded-chip px-2 py-0.5 text-[length:var(--text-caption)] font-semibold',
                  '[&>svg]:size-3',
                  trendStyle[trend],
                ].join(' ')}
              >
                {trendIcon[trend]}
                {formattedDelta}
              </span>
              {deltaLabel && (
                <span className="text-[length:var(--text-caption)] text-on-surface-variant">
                  {deltaLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

KpiCard.displayName = 'KpiCard';
