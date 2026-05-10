import type { CallPerformanceConversionItem } from '../../../types/call-performance';
import { formatDecimal, formatNumber } from '../../../lib/formatters';
import DashboardPanel from '../ui/dashboard-panel';
import { TableShell } from '../../ui/v2/table-shell';
import { getTableContract } from '../../ui/v2/table-contract';

interface Props {
  data: CallPerformanceConversionItem[];
}

export default function CallPerformanceConversion({ data }: Props) {
  const denseTable = getTableContract('dense');

  if (data.length === 0) {
    return (
      <DashboardPanel className="p-6 text-[length:var(--text-body-sm)] text-on-surface-variant">
        Không có dữ liệu chuyển đổi cuộc gọi trong khoảng thời gian này.
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel className="overflow-hidden p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Call-to-Status Conversion</h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">Số cuộc gọi cần thiết trước khi lead Qualified / Unqualified</p>
      </div>

      <TableShell variant="dense" className="rounded-card border border-outline-variant/40" scrollClassName="overflow-x-auto" tableClassName="min-w-[760px]">
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
