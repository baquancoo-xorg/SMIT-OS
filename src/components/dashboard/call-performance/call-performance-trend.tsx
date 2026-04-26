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

interface Props {
  data: CallPerformanceTrendItem[];
}

export default function CallPerformanceTrend({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm p-6 text-sm text-slate-500">
        Không có dữ liệu xu hướng cuộc gọi.
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm p-4 h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="count" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="duration" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Legend />
          <Line yAxisId="count" type="monotone" dataKey="calls" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Calls" />
          <Line yAxisId="count" type="monotone" dataKey="answered" stroke="#16a34a" strokeWidth={2} dot={false} name="Answered" />
          <Line yAxisId="duration" type="monotone" dataKey="avgDuration" stroke="#f59e0b" strokeWidth={2} dot={false} name="Avg Duration (s)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
