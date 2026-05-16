/**
 * Zone D — SMIT-OS performance snapshot (attendance heatmap + KR progress).
 */

import { RefreshCw } from 'lucide-react';
import { useSmitosMetricsQuery, useRefreshSmitosMutation } from '../../../../hooks/use-personnel-integrations';
import { Card } from '../../../ui';

interface Props {
  personnelId: string;
}

export function SmitosZone({ personnelId }: Props) {
  const { data, isLoading } = useSmitosMetricsQuery(personnelId);
  const refresh = useRefreshSmitosMutation(personnelId);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-card bg-surface-2" />;
  }
  if (!data) {
    return (
      <Card padding="lg">
        <p className="text-sm text-error">Không tải được SMIT-OS metrics</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card padding="lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Chuyên cần tháng này</p>
            <h3 className="mt-1 font-headline text-lg font-black text-text-1">
              {data.attendance.submitted}/{data.attendance.businessDays} ngày
              <span className="ml-2 text-sm text-text-2">({data.attendance.rate}%)</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending}
            className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1 text-xs text-text-2 hover:text-text-1 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${refresh.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {data.attendance.daily.map((d) => (
            <div
              key={d.date}
              title={`${d.date}${d.submitted ? ' · đã submit' : ' · thiếu'}`}
              className={[
                'size-5 rounded-md',
                d.submitted ? 'bg-emerald-500/70' : 'bg-rose-500/30',
              ].join(' ')}
            />
          ))}
        </div>
        <p className="mt-3 text-[11px] text-text-muted">
          Mỗi ô = 1 ngày làm việc (T2–T6). Xanh = có daily report, đỏ = thiếu.
        </p>
      </Card>

      <Card padding="lg">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">KR Progress</p>
        <h3 className="mt-1 font-headline text-lg font-black text-text-1">Mục tiêu cá nhân</h3>

        {data.krs.length === 0 ? (
          <p className="mt-4 text-sm text-text-2">Chưa có KR được gán.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.krs.map((k) => (
              <li key={k.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate text-text-1">{k.title}</span>
                  <span className="shrink-0 font-mono text-xs text-text-2">
                    {k.current}/{k.target} {k.unit}
                  </span>
                  <span className={[
                    'shrink-0 w-12 text-right font-semibold tabular-nums text-xs',
                    k.progress >= 70 ? 'text-emerald-500' :
                    k.progress >= 40 ? 'text-amber-500' : 'text-rose-500',
                  ].join(' ')}>{k.progress}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={[
                      'h-full rounded-full transition-all',
                      k.progress >= 70 ? 'bg-emerald-500' :
                      k.progress >= 40 ? 'bg-amber-500' : 'bg-rose-500',
                    ].join(' ')}
                    style={{ width: `${Math.min(100, k.progress)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
