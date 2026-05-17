/**
 * Workload section — DailyReport submission count per personnel for current month.
 * SMIT-OS internal source only (no external tasks system).
 * v4: rounded-card, progress bar uses var(--brand-500) accent.
 */

import { Activity } from 'lucide-react';
import { Card } from '../../../ui';
import type { WorkloadData } from '../../../../hooks/use-personnel-dashboard';

interface Props {
  data: WorkloadData | undefined;
}

function barTone(rate: number): string {
  if (rate >= 80) return 'bg-success';
  if (rate >= 60) return 'bg-warning';
  return 'bg-error';
}

export function WorkloadSection({ data }: Props) {
  return (
    <Card padding="md">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-card bg-surface-2 p-2 text-accent-text">
          <Activity className="size-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Workload</p>
          <h3 className="font-headline text-base font-black text-text-1">
            Daily reports tháng {data?.monthLabel ?? '—'}
          </h3>
        </div>
      </div>

      {!data || data.entries.length === 0 ? (
        <p className="rounded-input border border-dashed border-border bg-surface-2/40 px-4 py-6 text-center text-xs text-text-muted">
          Chưa có dữ liệu báo cáo cho tháng này.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {data.entries.map((e) => (
            <li key={e.personnelId} className="flex items-center gap-3 rounded-input bg-surface-1 px-3 py-2">
              <div className="size-8 shrink-0 overflow-hidden rounded-full bg-surface-2">
                {e.avatar ? (
                  <img src={e.avatar} alt={e.fullName} className="size-full object-cover" loading="lazy" />
                ) : (
                  <div className="grid size-full place-items-center text-xs font-bold text-text-muted">
                    {e.fullName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-xs font-bold text-text-1">{e.fullName}</p>
                  <p className="font-mono text-[11px] text-text-muted">
                    {e.submitted}/{e.businessDays} ngày · {e.rate}%
                  </p>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full transition-all ${barTone(e.rate)}`}
                    style={{ width: `${Math.min(100, e.rate)}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
