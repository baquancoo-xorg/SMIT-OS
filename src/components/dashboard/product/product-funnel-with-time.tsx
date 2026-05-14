// Funnel-with-Time — funnel hiện tại + label "↓ avg X.Yd" giữa step
// Maps TTV step (created→sync, sync→feature, feature→pql) vào funnel transition

import { useProductFunnel, useProductTtv } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import { Skeleton } from '../../v5/ui';

interface ProductFunnelWithTimeProps {
  range: DateRange;
}

const STEP_COLORS = [
  'var(--sys-color-accent)',
  'var(--sys-color-accent-text)',
  'var(--color-info)',
  'var(--color-info-container)',
];

function formatAvgDays(days: number): string {
  if (days <= 0) return '<1d';
  if (days < 1) return `${Math.round(days * 24)}h`;
  if (days < 10) return `${days.toFixed(1)}d`;
  return `${Math.round(days)}d`;
}

export function ProductFunnelWithTime({ range }: ProductFunnelWithTimeProps) {
  const funnel = useProductFunnel(range);
  const ttv = useProductTtv(range);

  const isLoading = funnel.isLoading || ttv.isLoading;
  const hasError = funnel.error || !funnel.data || !funnel.data.steps.length;

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Funnel with Time-to-Value</h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
          Step counts với drop-off % + avg days transition giữa step
        </p>
      </div>

      {isLoading ? (
        <Skeleton variant="rect" className="h-[280px] rounded-card" />
      ) : hasError ? (
        <div className="flex h-[200px] items-center justify-center rounded-card border border-outline-variant/40 text-[length:var(--text-body-sm)] text-on-surface-variant">
          Chưa có dữ liệu funnel
        </div>
      ) : (
        <div className="space-y-2 rounded-card border border-outline-variant/40 p-4">
          {funnel.data!.steps.map((step, idx) => {
            const maxCount = Math.max(...funnel.data!.steps.map((s) => s.count), 1);
            const widthPct = (step.count / maxCount) * 100;
            // TTV step idx maps to funnel transition idx-1
            // funnel idx 0→1: TTV step[0] (created→first_sync)
            // funnel idx 1→2: TTV step[1] (first_sync→feature_activated)
            // funnel idx 2→3: TTV step[2] (feature_activated→pql)
            const ttvStep = idx > 0 ? ttv.data?.steps[idx - 1] : null;
            const hasSample = ttvStep && ttvStep.sampleSize > 0;

            return (
              <div key={step.name}>
                {idx > 0 && (
                  <div className="ml-32 flex items-center gap-2 py-1.5">
                    <span className="inline-block h-4 w-px bg-outline-variant" />
                    {hasSample ? (
                      <span className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] tabular-nums text-on-surface-variant">
                        ↓ ~{formatAvgDays(ttvStep!.avgDays)} (avg · n={ttvStep!.sampleSize})
                      </span>
                    ) : (
                      <span className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant/60">
                        ↓ — (no data)
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-32 truncate text-[length:var(--text-body-sm)] font-semibold text-on-surface" title={step.displayName}>
                    {step.displayName}
                  </div>
                  <div className="relative h-8 flex-1 overflow-hidden rounded-full bg-surface-variant/40">
                    <div
                      className="absolute inset-y-0 left-0 flex items-center rounded-full px-3 text-[length:var(--text-body-sm)] font-semibold tabular-nums text-on-primary"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: STEP_COLORS[idx % STEP_COLORS.length],
                        minWidth: '60px',
                      }}
                    >
                      {step.count.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-16 text-right text-[length:var(--text-body-sm)] font-semibold tabular-nums">
                    {idx > 0 && step.dropOffPct > 0 ? (
                      <span className="text-error">−{step.dropOffPct}%</span>
                    ) : (
                      <span className="text-on-surface-variant/60">—</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardPanel>
  );
}
