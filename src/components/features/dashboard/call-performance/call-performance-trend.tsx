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
import type { CallPerformanceTrendItem } from '../../../../types/call-performance';
import DashboardPanel from '../ui/dashboard-panel';

interface Props {
  data: CallPerformanceTrendItem[];
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function TrendTooltipContent({ active, payload, label }: TrendTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-outline-variant/40 bg-surface-2/90 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-black text-on-surface">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4 text-xs font-semibold">
            <span style={{ color: item.color ?? 'var(--sys-color-text-2)' }}>{item.name}</span>
            <span className="text-on-surface tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CallPerformanceTrend({ data }: Props) {
  if (data.length === 0) {
    return (
      <DashboardPanel className="p-6 text-[length:var(--text-body-sm)] text-on-surface-variant">
        Không có dữ liệu xu hướng cuộc gọi.
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Call Trend Over Time</h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">Xu hướng Calls, Answered và Avg Duration theo ngày</p>
      </div>

      <div className="h-[300px] rounded-card border border-outline-variant/40 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--md-sys-color-outline-variant, var(--sys-color-border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="count" tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis yAxisId="duration" orientation="right" tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<TrendTooltipContent />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '10px' }} />
            <Line yAxisId="count" type="monotone" dataKey="calls" stroke="var(--color-info)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Calls" />
            <Line yAxisId="count" type="monotone" dataKey="answered" stroke="var(--color-success)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Answered" />
            <Line yAxisId="duration" type="monotone" dataKey="avgDuration" stroke="var(--color-warning)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Avg Duration (s)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardPanel>
  );
}
