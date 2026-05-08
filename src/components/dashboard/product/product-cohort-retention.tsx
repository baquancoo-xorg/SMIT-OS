// Cohort Retention Heatmap — replace iframe Phase 1
// Y = cohort week (e.g. "2026-W18"), X = D0/D1/D7/D14/D30, value = % active

import { useState } from 'react';
import { useProductCohort } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';

interface ProductCohortRetentionProps {
  range: DateRange;
}

const RETENTION_KEYS: Array<{ key: 'd0' | 'd1' | 'd7' | 'd14' | 'd30'; label: string }> = [
  { key: 'd0', label: 'D0' },
  { key: 'd1', label: 'D1' },
  { key: 'd7', label: 'D7' },
  { key: 'd14', label: 'D14' },
  { key: 'd30', label: 'D30' },
];

function levelClass(pct: number) {
  if (pct === 0) return 'bg-slate-100 text-slate-400';
  if (pct < 20) return 'bg-blue-100 text-blue-700';
  if (pct < 40) return 'bg-blue-200 text-blue-800';
  if (pct < 60) return 'bg-blue-400 text-white';
  if (pct < 80) return 'bg-blue-600 text-white';
  return 'bg-blue-800 text-white';
}

export function ProductCohortRetention({ range }: ProductCohortRetentionProps) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const { data, isLoading, error } = useProductCohort(range);

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Cohort Retention Heatmap</h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
          % business active sau N ngày kể từ tuần signup
        </p>
      </div>

      {isLoading ? (
        <div className="h-[280px] animate-pulse bg-slate-100 rounded-2xl" />
      ) : error || !data ? (
        <div className="h-[200px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          Không tải được cohort data
        </div>
      ) : data.cohorts.length === 0 ? (
        <div className="h-[200px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          {data.message ?? 'Chưa có cohort data trong khoảng này'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 p-3 md:p-4">
          <div className="min-w-[600px] space-y-1">
            <div className="grid gap-1 text-[10px] font-bold text-slate-400" style={{ gridTemplateColumns: '120px 80px repeat(5, minmax(56px, 1fr))' }}>
              <div>Cohort week</div>
              <div className="text-right">Size</div>
              {RETENTION_KEYS.map((k) => (
                <div key={k.key} className="text-center">{k.label}</div>
              ))}
            </div>
            {data.cohorts.map((c) => (
              <div
                key={c.cohort}
                className="grid gap-1 items-center"
                style={{ gridTemplateColumns: '120px 80px repeat(5, minmax(56px, 1fr))' }}
              >
                <div className="text-xs font-semibold text-slate-600">{c.cohort}</div>
                <div className="text-xs font-bold text-slate-500 text-right tabular-nums">{c.size}</div>
                {RETENTION_KEYS.map((k) => {
                  const value = c.retention[k.key];
                  const label = `${c.cohort} ${k.label}: ${value}% (${Math.round((value / 100) * c.size)}/${c.size})`;
                  return (
                    <button
                      type="button"
                      key={k.key}
                      aria-label={label}
                      onMouseEnter={() => setActiveLabel(label)}
                      onFocus={() => setActiveLabel(label)}
                      onTouchStart={() => setActiveLabel(label)}
                      className={`h-9 rounded text-xs font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/35 ${levelClass(value)}`}
                    >
                      {value}%
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-semibold text-slate-500">
            {activeLabel ?? 'Di chuột vào ô để xem chi tiết retention.'}
          </p>
        </div>
      )}
    </DashboardPanel>
  );
}
