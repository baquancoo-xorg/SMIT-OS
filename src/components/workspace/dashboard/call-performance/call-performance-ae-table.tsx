import type { CallPerformancePerAeItem } from '@/types/call-performance';
import { formatDecimal, formatNumber, formatPercent } from '@/lib/formatters';
import DashboardPanel from '@/components/workspace/dashboard/ui/dashboard-panel';
import { TableShell } from '@/components/ui/table-shell';
import { getTableContract } from '@/components/ui/table-contract';

interface Props {
  data: CallPerformancePerAeItem[];
}

export default function CallPerformanceAeTable({ data }: Props) {
  const denseTable = getTableContract('dense');

  if (data.length === 0) {
    return (
      <DashboardPanel className="p-6 text-[length:var(--text-body-sm)] text-on-surface-variant">
        Không có dữ liệu theo bộ lọc đã chọn.
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel className="overflow-hidden p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Per-AE Call Metrics</h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">Khối lượng gọi, tỷ lệ bắt máy và hiệu suất theo từng AE</p>
      </div>

      <TableShell variant="dense" className="rounded-card border border-outline-variant/40" scrollClassName="overflow-x-auto" tableClassName="min-w-[920px]">
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
