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
import type { CallPerformanceTrendItem } from '../../../types/call-performance';
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
    <div className="rounded-xl border border-black/5 bg-white/90 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-black text-slate-700">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4 text-xs font-semibold">
            <span style={{ color: item.color ?? '#475569' }}>{item.name}</span>
            <span className="text-slate-700 tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CallPerformanceTrend({ data }: Props) {
  if (data.length === 0) {
    return (
      <DashboardPanel className="p-6 text-sm text-slate-500">
        Không có dữ liệu xu hướng cuộc gọi.
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Call Trend Over Time</h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">Xu hướng Calls, Answered và Avg Duration theo ngày</p>
      </div>

      <div className="h-[300px] rounded-2xl border border-slate-100 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="count" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis yAxisId="duration" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<TrendTooltipContent />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '10px' }} />
            <Line yAxisId="count" type="monotone" dataKey="calls" stroke="#0ea5e9" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Calls" />
            <Line yAxisId="count" type="monotone" dataKey="answered" stroke="#16a34a" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Answered" />
            <Line yAxisId="duration" type="monotone" dataKey="avgDuration" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Avg Duration (s)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardPanel>
  );
}
