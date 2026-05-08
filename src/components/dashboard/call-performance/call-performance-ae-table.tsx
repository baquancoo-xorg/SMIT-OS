import type { CallPerformancePerAeItem } from '../../../types/call-performance';
import { formatDecimal, formatNumber, formatPercent } from '../../../lib/formatters';
import DashboardPanel from '../ui/dashboard-panel';
import { TableShell } from '../../ui/TableShell';
import { getTableContract } from '../../ui/table-contract';

interface Props {
  data: CallPerformancePerAeItem[];
}

export default function CallPerformanceAeTable({ data }: Props) {
  const denseTable = getTableContract('dense');

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

      <TableShell variant="dense" className="rounded-2xl border border-slate-100" scrollClassName="overflow-x-auto" tableClassName="min-w-[920px]">
        <thead>
          <tr className={denseTable.headerRow}>
            <th className={`${denseTable.headerCell} text-left`}>AE</th>
            <th className={`${denseTable.headerCell} text-right`}>Total Calls</th>
            <th className={`${denseTable.headerCell} text-right`}>Answered</th>
            <th className={`${denseTable.headerCell} text-right`}>Answer Rate</th>
            <th className={`${denseTable.headerCell} text-right`}>Avg Duration (s)</th>
            <th className={`${denseTable.headerCell} text-right`}>Leads Called</th>
            <th className={`${denseTable.headerCell} text-right`}>Calls / Lead</th>
          </tr>
        </thead>
        <tbody className={denseTable.body}>
          {data.map((row) => (
            <tr key={row.aeUserId} className={denseTable.row}>
              <td className={`${denseTable.cell} font-medium text-left`}>{row.aeName}</td>
              <td className={`${denseTable.cell} text-right tabular-nums`}>{formatNumber(row.totalCalls)}</td>
              <td className={`${denseTable.cell} text-right tabular-nums`}>{formatNumber(row.answeredCalls)}</td>
              <td className={`${denseTable.cell} text-right tabular-nums`}>{formatPercent(row.answerRate)}</td>
              <td className={`${denseTable.cell} text-right tabular-nums`}>{formatDecimal(row.avgDuration, 1)}</td>
              <td className={`${denseTable.cell} text-right tabular-nums`}>{formatNumber(row.totalLeadsCalled)}</td>
              <td className={`${denseTable.cell} text-right tabular-nums`}>{formatDecimal(row.callsPerLead, 1)}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </DashboardPanel>
  );
}
