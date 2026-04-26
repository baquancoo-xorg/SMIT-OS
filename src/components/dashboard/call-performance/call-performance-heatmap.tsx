import { useState } from 'react';
import type { CallPerformanceHeatmapItem } from '../../../types/call-performance';
import DashboardPanel from '../ui/dashboard-panel';

// dayOfWeek contract từ backend: 0 = CN, 1 = T2 ... 6 = T7.
const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

interface Props {
  data: CallPerformanceHeatmapItem[];
}

function levelClass(value: number, max: number) {
  if (value === 0 || max === 0) return 'bg-slate-100';
  const ratio = value / max;
  if (ratio < 0.2) return 'bg-blue-100';
  if (ratio < 0.4) return 'bg-blue-200';
  if (ratio < 0.6) return 'bg-blue-400';
  if (ratio < 0.8) return 'bg-blue-600';
  return 'bg-blue-800';
}

export default function CallPerformanceHeatmap({ data }: Props) {
  const [activeCellLabel, setActiveCellLabel] = useState<string | null>(null);
  const max = data.reduce((acc, item) => Math.max(acc, item.callCount), 0);
  const map = new Map(data.map((item) => [`${item.dayOfWeek}-${item.hour}`, item.callCount]));

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Call Distribution Heatmap</h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">Phân bổ cuộc gọi theo ngày trong tuần và khung giờ</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 p-3 md:p-4">
        <div className="min-w-[900px] space-y-2">
          <div className="grid grid-cols-[60px_repeat(24,minmax(24px,1fr))] gap-1 text-[10px] text-slate-400">
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-center">{h}</div>
            ))}
          </div>

          {DAYS.map((day, dow) => (
            <div key={day} className="grid grid-cols-[60px_repeat(24,minmax(24px,1fr))] gap-1 items-center">
              <div className="text-xs font-semibold text-slate-500">{day}</div>
              {Array.from({ length: 24 }, (_, hour) => {
                const count = map.get(`${dow}-${hour}`) ?? 0;
                const label = `${day} ${hour}h: ${count} calls`;
                return (
                  <button
                    type="button"
                    key={`${dow}-${hour}`}
                    aria-label={label}
                    onMouseEnter={() => setActiveCellLabel(label)}
                    onFocus={() => setActiveCellLabel(label)}
                    onTouchStart={() => setActiveCellLabel(label)}
                    className={`h-6 w-full rounded ${levelClass(count, max)} focus:outline-none focus:ring-2 focus:ring-primary/35`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] font-semibold text-slate-500">
          {activeCellLabel ?? 'Di chuột hoặc chạm vào ô để xem số cuộc gọi.'}
        </p>
      </div>
    </DashboardPanel>
  );
}
