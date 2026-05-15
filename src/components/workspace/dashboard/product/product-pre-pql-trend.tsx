// Pre-PQL Rate Trend — line chart theo range page-level
// PLG Gate metric #1 (Master Plan §3) — target ≥45%

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useProductTrends } from '@/hooks/use-product-dashboard';
import type { DateRange } from '@/types/dashboard-product';
import DashboardPanel from '@/components/workspace/dashboard/ui/dashboard-panel';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductPrePqlTrendProps {
  range: DateRange;
}

const PLG_GATE_TARGET = 45;

interface TooltipPayloadItem {
  value: number;
  color?: string;
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function PrePqlTooltip({ active, payload, label }: TrendTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-card border border-outline-variant/40 bg-surface/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-[length:var(--text-body-sm)] font-semibold text-on-surface">{label}</p>
      <div className="flex items-center justify-between gap-4 text-[length:var(--text-body-sm)] font-medium">
        <span style={{ color: payload[0].color ?? 'var(--color-info)' }}>Pre-PQL Rate</span>
        <span className="tabular-nums text-on-surface">{payload[0].value}%</span>
      </div>
    </div>
  );
}

export function ProductPrePqlTrend({ range }: ProductPrePqlTrendProps) {
  const { data, isLoading, error } = useProductTrends(range, 'pre_pql_rate');

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Pre-PQL Rate Trend</h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
          PLG Gate metric #1 — target ≥{PLG_GATE_TARGET}% (Master Plan §3)
        </p>
      </div>

      {isLoading ? (
        <Skeleton variant="rect" className="h-[300px] rounded-card" />
      ) : error || !data || data.points.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center rounded-card border border-outline-variant/40 text-[length:var(--text-body-sm)] text-on-surface-variant">
          Chưa có dữ liệu Pre-PQL trend trong khoảng này
        </div>
      ) : (
        <div className="h-[300px] rounded-card border border-outline-variant/40 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.points} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--md-sys-color-outline-variant, var(--sys-color-border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'auto']}
                unit="%"
              />
              <Tooltip content={<PrePqlTooltip />} />
              <ReferenceLine
                y={PLG_GATE_TARGET}
                stroke="var(--color-success)"
                strokeDasharray="4 4"
                label={{ value: `Target ${PLG_GATE_TARGET}%`, position: 'right', fontSize: 10, fill: 'var(--color-success)', fontWeight: 700 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-info)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                name="Pre-PQL Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardPanel>
  );
}
