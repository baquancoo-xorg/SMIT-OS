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
import { useProductCohort } from '@/hooks/use-product-dashboard';
import type { DateRange } from '@/types/dashboard-product';
import DashboardPanel from '@/components/workspace/dashboard/ui/dashboard-panel';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCohortActivationCurveProps {
  range: DateRange;
}

const CURVE_COLORS = [
  'var(--color-info)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-secondary)',
  'var(--sys-color-accent)',
  'var(--sys-color-accent-text)',
];

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
    <div className="rounded-card border border-outline-variant/40 bg-surface/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-[length:var(--text-body-sm)] font-semibold text-on-surface">Day {label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4 text-[length:var(--text-body-sm)] font-medium">
            <span style={{ color: item.color ?? 'var(--sys-color-text-2)' }}>{item.name}</span>
            <span className="tabular-nums text-on-surface">{item.value}%</span>
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
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Cohort Activation Curve</h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
          Top 6 cohort gần nhất · % business active theo D0/D1/D7/D14/D30
        </p>
      </div>

      {isLoading ? (
        <Skeleton variant="rect" className="h-[300px] rounded-card" />
      ) : error || chartData.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-card border border-outline-variant/40 text-[length:var(--text-body-sm)] text-on-surface-variant">
          Chưa có cohort data
        </div>
      ) : (
        <div className="h-[300px] rounded-card border border-outline-variant/40 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--md-sys-color-outline-variant, var(--sys-color-border))" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }}
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
