// Activation Heatmap — single component, dropdown switch 3 view
// Hour×Day-of-week · Cohort×Days-since-signup · Top-50 Business×Days

import { useMemo, useState } from 'react';
import { useProductHeatmap } from '../../../hooks/use-product-dashboard';
import type { DateRange, HeatmapView, HeatmapCell } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import { Skeleton } from '../../ui';

interface ProductActivationHeatmapProps {
  range: DateRange;
}

const VIEW_OPTIONS: Array<{ value: HeatmapView; label: string; desc: string }> = [
  { value: 'hour-day', label: 'Hour × Day', desc: 'Giờ vàng sử dụng (24h × Mon-Sun)' },
  { value: 'cohort', label: 'Cohort × Days', desc: 'Activation theo cohort tuần signup' },
  { value: 'business', label: 'Business × Days', desc: 'Top 50 business × ngày trong khoảng' },
];

function levelClass(value: number, max: number) {
  if (value === 0 || max === 0) return 'bg-surface-variant/60';
  const ratio = value / max;
  if (ratio < 0.2) return 'bg-blue-100';
  if (ratio < 0.4) return 'bg-blue-200';
  if (ratio < 0.6) return 'bg-blue-400';
  if (ratio < 0.8) return 'bg-blue-600';
  return 'bg-blue-800';
}

export function ProductActivationHeatmap({ range }: ProductActivationHeatmapProps) {
  const [view, setView] = useState<HeatmapView>('hour-day');
  const [activeCellLabel, setActiveCellLabel] = useState<string | null>(null);
  const { data, isLoading, error } = useProductHeatmap(range, view);

  const { maxValue, cellMap } = useMemo(() => {
    if (!data) return { maxValue: 0, cellMap: new Map<string, HeatmapCell>() };
    const map = new Map<string, HeatmapCell>();
    let max = 0;
    for (const c of data.cells) {
      map.set(`${c.y}__${c.x}`, c);
      if (c.value > max) max = c.value;
    }
    return { maxValue: max, cellMap: map };
  }, [data]);

  const description = VIEW_OPTIONS.find((v) => v.value === view)?.desc ?? '';
  const valueSuffix = view === 'cohort' ? '%' : '';

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Activation Heatmap</h3>
          <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">{description}</p>
        </div>
        <select
          value={view}
          onChange={(e) => setView(e.target.value as HeatmapView)}
          className="rounded-chip border border-outline-variant/40 bg-surface px-3 py-1 text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant hover:bg-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/35"
        >
          {VIEW_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Skeleton variant="rect" className="h-[260px] rounded-card" />
      ) : error || !data || data.cells.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-card border border-outline-variant/40 text-[length:var(--text-body-sm)] text-on-surface-variant">
          Chưa có dữ liệu cho view này
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-outline-variant/40 p-3 md:p-4">
          <div className="min-w-[700px] space-y-1">
            <div
              className="grid gap-1 text-[length:var(--text-caption)] font-semibold text-on-surface-variant"
              style={{ gridTemplateColumns: `120px repeat(${data.xLabels.length}, minmax(28px, 1fr))` }}
            >
              <div />
              {data.xLabels.map((x) => (
                <div key={x} className="truncate text-center" title={x}>
                  {x}
                </div>
              ))}
            </div>

            {data.yLabels.map((y) => (
              <div
                key={y}
                className="grid items-center gap-1"
                style={{ gridTemplateColumns: `120px repeat(${data.xLabels.length}, minmax(28px, 1fr))` }}
              >
                <div className="truncate text-[length:var(--text-body-sm)] font-semibold text-on-surface-variant" title={y}>
                  {y}
                </div>
                {data.xLabels.map((x) => {
                  const cell = cellMap.get(`${y}__${x}`);
                  const value = cell?.value ?? 0;
                  const label = cell?.label
                    ? `${y} · ${x}: ${value}${valueSuffix} (${cell.label})`
                    : `${y} · ${x}: ${value}${valueSuffix}`;
                  return (
                    <button
                      type="button"
                      key={`${y}-${x}`}
                      aria-label={label}
                      onMouseEnter={() => setActiveCellLabel(label)}
                      onFocus={() => setActiveCellLabel(label)}
                      onTouchStart={() => setActiveCellLabel(label)}
                      className={`h-6 w-full rounded ${levelClass(value, maxValue)} focus:outline-none focus:ring-2 focus:ring-primary/35`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[length:var(--text-caption)] font-medium text-on-surface-variant">
            {activeCellLabel ?? `Di chuột vào ô để xem giá trị (max: ${maxValue.toLocaleString()}${valueSuffix}).`}
          </p>
        </div>
      )}
    </DashboardPanel>
  );
}
