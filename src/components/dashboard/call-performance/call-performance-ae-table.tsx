import type { CallPerformancePerAeItem } from '../../../types/call-performance';
import { formatNumber, formatPercent } from '../../../lib/formatters';
import DashboardPanel from '../ui/dashboard-panel';

interface Props {
  data: CallPerformancePerAeItem[];
}

export default function CallPerformanceAeTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <DashboardPanel className="p-6 text-sm text-slate-500">
        Không có dữ liệu theo bộ lọc đã chọn.
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel className="overflow-hidden p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Per-AE Call Metrics</h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">Khối lượng gọi, tỷ lệ bắt máy và hiệu suất theo từng AE</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-sm min-w-[920px]">
          <thead className="bg-slate-100/80 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">AE</th>
              <th className="px-4 py-3 text-right">Total Calls</th>
              <th className="px-4 py-3 text-right">Answered</th>
              <th className="px-4 py-3 text-right">Answer Rate</th>
              <th className="px-4 py-3 text-right">Avg Duration (s)</th>
              <th className="px-4 py-3 text-right">Leads Called</th>
              <th className="px-4 py-3 text-right">Calls / Lead</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.aeUserId} className="border-t border-slate-100 text-slate-700">
                <td className="px-4 py-3 font-medium">{row.aeName}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.totalCalls)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.answeredCalls)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPercent(row.answerRate)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.avgDuration)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.totalLeadsCalled)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.callsPerLead)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  );
}
