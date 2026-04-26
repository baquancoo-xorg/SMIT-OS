import type { CallPerformanceHeatmapItem } from '../../../types/call-performance';
import DashboardPanel from '../ui/dashboard-panel';

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
  const max = data.reduce((acc, item) => Math.max(acc, item.callCount), 0);
  const map = new Map(data.map((item) => [`${item.dayOfWeek}-${item.hour}`, item.callCount]));

  return (
    <DashboardPanel className="p-4">
      <div className="overflow-x-auto">
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
                return (
                  <div
                    key={`${dow}-${hour}`}
                    title={`${day} ${hour}h: ${count} calls`}
                    className={`h-6 rounded ${levelClass(count, max)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}
