import type { CallPerformanceConversionItem } from '../../../types/call-performance';
import { formatNumber } from '../../../lib/formatters';
import DashboardPanel from '../ui/dashboard-panel';

interface Props {
  data: CallPerformanceConversionItem[];
}

export default function CallPerformanceConversion({ data }: Props) {
  if (data.length === 0) {
    return (
      <DashboardPanel className="p-6 text-sm text-slate-500">
        Không có dữ liệu chuyển đổi cuộc gọi trong khoảng thời gian này.
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-slate-100/80 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">AE</th>
              <th className="px-4 py-3 text-right">Calls → Qualified</th>
              <th className="px-4 py-3 text-right">Calls → Unqualified</th>
              <th className="px-4 py-3 text-right">Avg Calls Before Close</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.aeUserId} className="border-t border-slate-100 text-slate-700">
                <td className="px-4 py-3 font-medium">{row.aeName}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.callsToQualified)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.callsToUnqualified)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.avgCallsBeforeClose)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  );
}
