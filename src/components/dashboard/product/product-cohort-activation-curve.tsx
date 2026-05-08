// Cohort Activation Curve — multi-line chart, top 4-6 cohort recent
// Reuses cohort retention data, transforms vào time-series format

import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useProductCohort } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';

interface ProductCohortActivationCurveProps {
  range: DateRange;
}

const CURVE_COLORS = ['#0ea5e9', '#16a34a', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
}

interface CurveTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CurveTooltip({ active, payload, label }: CurveTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-black/5 bg-white/90 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-black text-slate-700">Day {label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4 text-xs font-semibold">
            <span style={{ color: item.color ?? '#475569' }}>{item.name}</span>
            <span className="text-slate-700 tabular-nums">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductCohortActivationCurve({ range }: ProductCohortActivationCurveProps) {
  const { data, isLoading, error } = useProductCohort(range);

  // Transform: rows by day-since-signup, columns = cohort retention %
  const chartData = useMemo(() => {
    if (!data || data.cohorts.length === 0) return [];
    const cohorts = data.cohorts.slice(0, 6); // top 6 most recent
    const days = [0, 1, 7, 14, 30];
    return days.map((d) => {
      const point: Record<string, number | string> = { day: `D${d}` };
      for (const c of cohorts) {
        const key = `d${d}` as 'd0' | 'd1' | 'd7' | 'd14' | 'd30';
        point[c.cohort] = c.retention[key];
      }
      return point;
    });
  }, [data]);

  const cohorts = data?.cohorts.slice(0, 6) ?? [];

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Cohort Activation Curve</h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
          Top 6 cohort gần nhất · % business active theo D0/D1/D7/D14/D30
        </p>
      </div>

      {isLoading ? (
        <div className="h-[300px] animate-pulse bg-slate-100 rounded-2xl" />
      ) : error || chartData.length === 0 ? (
        <div className="h-[200px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          Chưa có cohort data
        </div>
      ) : (
        <div className="h-[300px] rounded-2xl border border-slate-100 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip content={<CurveTooltip />} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '10px' }}
              />
              {cohorts.map((c, idx) => (
                <Line
                  key={c.cohort}
                  type="monotone"
                  dataKey={c.cohort}
                  stroke={CURVE_COLORS[idx % CURVE_COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name={c.cohort}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardPanel>
  );
}
