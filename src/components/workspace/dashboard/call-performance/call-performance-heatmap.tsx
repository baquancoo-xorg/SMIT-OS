import { useState } from 'react';
import type { CallPerformanceHeatmapItem } from '@/types/call-performance';
import DashboardPanel from '@/components/workspace/dashboard/ui/dashboard-panel';

// dayOfWeek contract từ backend: 0 = CN, 1 = T2 ... 6 = T7.
const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

interface Props {
  data: CallPerformanceHeatmapItem[];
}

function levelClass(value: number, max: number) {
  if (value === 0 || max === 0) return 'bg-surface-variant/60';
  const ratio = value / max;
  if (ratio < 0.2) return 'bg-primary/15';
  if (ratio < 0.4) return 'bg-primary/25';
  if (ratio < 0.6) return 'bg-primary/45';
  if (ratio < 0.8) return 'bg-primary/70';
  return 'bg-primary/90';
}

export default function CallPerformanceHeatmap({ data }: Props) {
  const [activeCellLabel, setActiveCellLabel] = useState<string | null>(null);
  const max = data.reduce((acc, item) => Math.max(acc, item.callCount), 0);
  const map = new Map(data.map((item) => [`${item.dayOfWeek}-${item.hour}`, item.callCount]));

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Call Distribution Heatmap</h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">Phân bổ cuộc gọi theo ngày trong tuần và khung giờ</p>
      </div>

      <div className="overflow-x-auto rounded-card border border-outline-variant/40 p-3 md:p-4">
        <div className="min-w-[900px] space-y-2">
          <div className="grid grid-cols-[60px_repeat(24,minmax(24px,1fr))] gap-1 text-[length:var(--text-caption)] text-on-surface-variant">
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-center">{h}</div>
            ))}
          </div>

          {DAYS.map((day, dow) => (
            <div key={day} className="grid grid-cols-[60px_repeat(24,minmax(24px,1fr))] items-center gap-1">
              <div className="text-[length:var(--text-body-sm)] font-semibold text-on-surface-variant">{day}</div>
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
                    className={`h-6 w-full rounded ${levelClass(count, max)} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[length:var(--text-body-sm)] font-semibold text-on-surface-variant">
          {activeCellLabel ?? 'Di chuột hoặc chạm vào ô để xem số cuộc gọi.'}
        </p>
      </div>
    </DashboardPanel>
  );
}
