// Activation Heatmap — single component, dropdown switch 3 view
// Hour×Day-of-week · Cohort×Days-since-signup · Top-50 Business×Days

import { useMemo, useState } from 'react';
import { useProductHeatmap } from '../../../hooks/use-product-dashboard';
import type { DateRange, HeatmapView, HeatmapCell } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';

interface ProductActivationHeatmapProps {
  range: DateRange;
}

const VIEW_OPTIONS: Array<{ value: HeatmapView; label: string; desc: string }> = [
  { value: 'hour-day', label: 'Hour × Day', desc: 'Giờ vàng sử dụng (24h × Mon-Sun)' },
  { value: 'cohort', label: 'Cohort × Days', desc: 'Activation theo cohort tuần signup' },
  { value: 'business', label: 'Business × Days', desc: 'Top 50 business × ngày trong khoảng' },
];

function levelClass(value: number, max: number) {
  if (value === 0 || max === 0) return 'bg-slate-100';
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
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Activation Heatmap</h3>
          <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">{description}</p>
        </div>
        <select
          value={view}
          onChange={(e) => setView(e.target.value as HeatmapView)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/35"
        >
          {VIEW_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-[260px] animate-pulse bg-slate-100 rounded-2xl" />
      ) : error || !data || data.cells.length === 0 ? (
        <div className="h-[200px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          Chưa có dữ liệu cho view này
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 p-3 md:p-4">
          <div className="min-w-[700px] space-y-1">
            <div
              className="grid gap-1 text-[10px] font-bold text-slate-400"
              style={{ gridTemplateColumns: `120px repeat(${data.xLabels.length}, minmax(28px, 1fr))` }}
            >
              <div />
              {data.xLabels.map((x) => (
                <div key={x} className="text-center truncate" title={x}>
                  {x}
                </div>
              ))}
            </div>

            {data.yLabels.map((y) => (
              <div
                key={y}
                className="grid gap-1 items-center"
                style={{ gridTemplateColumns: `120px repeat(${data.xLabels.length}, minmax(28px, 1fr))` }}
              >
                <div className="text-xs font-semibold text-slate-500 truncate" title={y}>
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
          <p className="mt-3 text-[11px] font-semibold text-slate-500">
            {activeCellLabel ?? `Di chuột vào ô để xem giá trị (max: ${maxValue.toLocaleString()}${valueSuffix}).`}
          </p>
        </div>
      )}
    </DashboardPanel>
  );
}
