import type { CallPerformanceConversionItem } from '../../../types/call-performance';
import { formatDecimal, formatNumber } from '../../../lib/formatters';
import DashboardPanel from '../ui/dashboard-panel';
import { TableShell } from '../../ui/table-shell';
import { getTableContract } from '../../ui/table-contract';

interface Props {
  data: CallPerformanceConversionItem[];
}

export default function CallPerformanceConversion({ data }: Props) {
  const denseTable = getTableContract('dense');

  if (data.length === 0) {
    return (
      <DashboardPanel className="p-6 text-sm text-slate-500">
        Không có dữ liệu chuyển đổi cuộc gọi trong khoảng thời gian này.
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel className="overflow-hidden p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Call-to-Status Conversion</h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">Số cuộc gọi cần thiết trước khi lead Qualified / Unqualified</p>
      </div>

      <TableShell variant="dense" className="rounded-2xl border border-slate-100" scrollClassName="overflow-x-auto" tableClassName="min-w-[760px]">
        <thead>
          <tr className={denseTable.headerRow}>
            <th className={`${denseTable.headerCell} text-left`}>AE</th>
            <th className={`${denseTable.headerCell} text-right`}>Calls → Qualified</th>
            <th className={`${denseTable.headerCell} text-right`}>Calls → Unqualified</th>
            <th className={`${denseTable.headerCell} text-right`}>Avg Calls Before Close</th>
          </tr>
        </thead>
        <tbody className={denseTable.body}>
          {data.map((row) => (
            <tr key={row.aeUserId} className={denseTable.row}>
              <td className={`${denseTable.cell} font-medium text-left`}>{row.aeName}</td>
              <td className={`${denseTable.cell} text-right tabular-nums`}>{formatNumber(row.callsToQualified)}</td>
              <td className={`${denseTable.cell} text-right tabular-nums`}>{formatNumber(row.callsToUnqualified)}</td>
              <td className={`${denseTable.cell} text-right tabular-nums`}>{formatDecimal(row.avgCallsBeforeClose, 1)}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </DashboardPanel>
  );
}
