// Cohort Retention Heatmap — replace iframe Phase 1
// Y = cohort week (e.g. "2026-W18"), X = D0/D1/D7/D14/D30, value = % active

import { useState } from 'react';
import { useProductCohort } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import { Skeleton } from '../../ui';

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
  if (pct === 0) return 'bg-surface-variant/60 text-on-surface-variant';
  if (pct < 20) return 'bg-primary/15 text-on-surface';
  if (pct < 40) return 'bg-primary/25 text-on-surface';
  if (pct < 60) return 'bg-primary/45 text-on-surface';
  if (pct < 80) return 'bg-primary/70 text-on-primary';
  return 'bg-primary/90 text-on-primary';
}

export function ProductCohortRetention({ range }: ProductCohortRetentionProps) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const { data, isLoading, error } = useProductCohort(range);

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Cohort Retention Heatmap</h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
          % business active sau N ngày kể từ tuần signup
        </p>
      </div>

      {isLoading ? (
        <Skeleton variant="rect" className="h-[280px] rounded-card" />
      ) : error || !data ? (
        <div className="flex h-[200px] items-center justify-center rounded-card border border-outline-variant/40 text-[length:var(--text-body-sm)] text-on-surface-variant">
          Không tải được cohort data
        </div>
      ) : data.cohorts.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-card border border-outline-variant/40 text-[length:var(--text-body-sm)] text-on-surface-variant">
          {data.message ?? 'Chưa có cohort data trong khoảng này'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-outline-variant/40 p-3 md:p-4">
          <div className="min-w-[600px] space-y-1">
            <div className="grid gap-1 text-[length:var(--text-caption)] font-semibold text-on-surface-variant" style={{ gridTemplateColumns: '120px 80px repeat(5, minmax(56px, 1fr))' }}>
              <div>Cohort week</div>
              <div className="text-right">Size</div>
              {RETENTION_KEYS.map((k) => (
                <div key={k.key} className="text-center">{k.label}</div>
              ))}
            </div>
            {data.cohorts.map((c) => (
              <div
                key={c.cohort}
                className="grid items-center gap-1"
                style={{ gridTemplateColumns: '120px 80px repeat(5, minmax(56px, 1fr))' }}
              >
                <div className="text-[length:var(--text-body-sm)] font-semibold text-on-surface">{c.cohort}</div>
                <div className="text-right text-[length:var(--text-body-sm)] font-semibold tabular-nums text-on-surface-variant">{c.size}</div>
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
          <p className="mt-3 text-[length:var(--text-caption)] font-medium text-on-surface-variant">
            {activeLabel ?? 'Di chuột vào ô để xem chi tiết retention.'}
          </p>
        </div>
      )}
    </DashboardPanel>
  );
}
