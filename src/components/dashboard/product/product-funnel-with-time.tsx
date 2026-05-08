// Funnel-with-Time — funnel hiện tại + label "↓ avg X.Yd" giữa step
// Maps TTV step (created→sync, sync→feature, feature→pql) vào funnel transition

import { useProductFunnel, useProductTtv } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';

interface ProductFunnelWithTimeProps {
  range: DateRange;
}

const STEP_COLORS = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];

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
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Funnel with Time-to-Value</h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
          Step counts với drop-off % + avg days transition giữa step
        </p>
      </div>

      {isLoading ? (
        <div className="h-[280px] animate-pulse bg-slate-100 rounded-2xl" />
      ) : hasError ? (
        <div className="h-[200px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          Chưa có dữ liệu funnel
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 p-4 space-y-2">
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
                    <span className="inline-block w-px h-4 bg-slate-300" />
                    {hasSample ? (
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest tabular-nums">
                        ↓ ~{formatAvgDays(ttvStep!.avgDays)} (avg · n={ttvStep!.sampleSize})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        ↓ — (no data)
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-32 text-xs font-semibold text-slate-600 truncate" title={step.displayName}>
                    {step.displayName}
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full flex items-center px-3 text-white text-xs font-bold tabular-nums"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: STEP_COLORS[idx % STEP_COLORS.length],
                        minWidth: '60px',
                      }}
                    >
                      {step.count.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-16 text-right text-xs font-bold tabular-nums">
                    {idx > 0 && step.dropOffPct > 0 ? (
                      <span className="text-rose-500">−{step.dropOffPct}%</span>
                    ) : (
                      <span className="text-slate-300">—</span>
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
