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
import { useProductTrends } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';

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
    <div className="rounded-xl border border-black/5 bg-white/90 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-black text-slate-700">{label}</p>
      <div className="flex items-center justify-between gap-4 text-xs font-semibold">
        <span style={{ color: payload[0].color ?? '#0ea5e9' }}>Pre-PQL Rate</span>
        <span className="text-slate-700 tabular-nums">{payload[0].value}%</span>
      </div>
    </div>
  );
}

export function ProductPrePqlTrend({ range }: ProductPrePqlTrendProps) {
  const { data, isLoading, error } = useProductTrends(range, 'pre_pql_rate');

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Pre-PQL Rate Trend</h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
          PLG Gate metric #1 — target ≥{PLG_GATE_TARGET}% (Master Plan §3)
        </p>
      </div>

      {isLoading ? (
        <div className="h-[300px] animate-pulse bg-slate-100 rounded-2xl" />
      ) : error || !data || data.points.length === 0 ? (
        <div className="h-[300px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          Chưa có dữ liệu Pre-PQL trend trong khoảng này
        </div>
      ) : (
        <div className="h-[300px] rounded-2xl border border-slate-100 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.points} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'auto']}
                unit="%"
              />
              <Tooltip content={<PrePqlTooltip />} />
              <ReferenceLine
                y={PLG_GATE_TARGET}
                stroke="#16a34a"
                strokeDasharray="4 4"
                label={{ value: `Target ${PLG_GATE_TARGET}%`, position: 'right', fontSize: 10, fill: '#16a34a', fontWeight: 700 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
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
