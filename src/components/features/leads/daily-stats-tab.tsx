import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { LeadDailyStat } from '../../../types';
import { TableShell } from '../../ui/table-shell';
import { getTableContract } from '../../ui/table-contract';
import { formatTableDate } from '../../ui/table-date-format';

function fmt(rate: number | null) {
  if (rate === null) return '-';
  return `${Math.round(rate * 100)}%`;
}

interface Props {
  dateFrom: string;
  dateTo: string;
}

export default function DailyStatsTab({ dateFrom, dateTo }: Props) {
  const standardTable = getTableContract('standard');

  const params: Record<string, string> = {};
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;

  const { data: stats = [], isLoading: loading } = useQuery<LeadDailyStat[]>({
    queryKey: ['lead-daily-stats', params],
    queryFn: () => api.getLeadDailyStats(params),
    staleTime: 60_000,
  });

  const aeList = [...new Set(stats.map((s) => s.ae))].sort();
  const dateList = [...new Set(stats.map((s) => s.date))].sort();
  const lookup = new Map<string, LeadDailyStat>();
  stats.forEach((s) => lookup.set(`${s.ae}|${s.date}`, s));

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      ) : (
        <TableShell variant="standard" className="border border-outline-variant/40" scrollClassName="max-h-[70vh] overflow-y-auto overflow-x-auto custom-scrollbar">
          <thead>
            <tr className={`${standardTable.headerRow} bg-surface-2`}>
              <th className={`${standardTable.headerCell} sticky top-0 z-30 border-r border-outline-variant/40 bg-surface-2`} rowSpan={2}>Date</th>
              {aeList.map((ae) => (
                <th key={ae} colSpan={5} className="sticky top-0 z-30 px-4 py-2.5 text-center text-[length:var(--text-body-sm)] font-semibold uppercase tracking-[var(--tracking-wide)] text-primary bg-surface-2 border-b border-r border-outline-variant/40">
                  {ae}
                </th>
              ))}
            </tr>
            <tr className="bg-surface-2 border-b border-outline-variant/40">
              {aeList.flatMap((ae) => [
                <th key={`${ae}-add`} className="sticky top-[46px] z-30 px-4 py-2.5 text-center text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant border-r border-outline-variant/40 bg-surface-2">New</th>,
                <th key={`${ae}-proc`} className="sticky top-[46px] z-30 px-4 py-2.5 text-center text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant border-r border-outline-variant/40 bg-surface-2">Done</th>,
                <th key={`${ae}-rem`} className="sticky top-[46px] z-30 px-4 py-2.5 text-center text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant border-r border-outline-variant/40 bg-surface-2">Remaining</th>,
                <th key={`${ae}-dr`} className="sticky top-[46px] z-30 px-4 py-2.5 text-center text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant border-r border-outline-variant/40 bg-surface-2">Daily%</th>,
                <th key={`${ae}-tr`} className="sticky top-[46px] z-30 px-4 py-2.5 text-center text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant border-r border-outline-variant/40 bg-surface-2">Total%</th>,
              ])}
            </tr>
          </thead>
          <tbody className={standardTable.body}>
            {dateList.length === 0 && (
              <tr>
                <td colSpan={1 + aeList.length * 5} className={standardTable.emptyState}>
                  <p className="font-semibold uppercase tracking-[var(--tracking-wide)] text-[length:var(--text-body-sm)] opacity-30">No data for this period</p>
                </td>
              </tr>
            )}
            {dateList.map((date) => (
              <tr key={date} className={standardTable.row}>
                <td className={`${standardTable.cell} font-semibold text-on-surface text-[length:var(--text-body-sm)] border-r border-outline-variant/40 bg-surface-variant/30`}>{formatTableDate(date)}</td>
                {aeList.flatMap((ae) => {
                  const s = lookup.get(`${ae}|${date}`);
                  const isHighRemaining = (s?.remaining ?? 0) > 10;
                  return [
                    <td key={`${ae}-${date}-add`} className="px-4 py-2.5 text-center text-[length:var(--text-body-sm)] font-bold text-on-surface-variant border-r border-outline-variant/40">{s?.added ?? 0}</td>,
                    <td key={`${ae}-${date}-proc`} className="px-4 py-2.5 text-center text-[length:var(--text-body-sm)] font-bold text-success border-r border-outline-variant/40">{s?.processed ?? 0}</td>,
                    <td key={`${ae}-${date}-rem`} className={`px-4 py-2.5 text-center text-[length:var(--text-body-sm)] font-semibold border-r border-outline-variant/40 ${isHighRemaining ? 'text-error' : 'text-on-surface'}`}>{s?.remaining ?? 0}</td>,
                    <td key={`${ae}-${date}-dr`} className="px-4 py-2.5 text-center text-[length:var(--text-body-sm)] font-bold text-on-surface-variant border-r border-outline-variant/40 italic">{s ? fmt(s.dailyRate) : '-'}</td>,
                    <td key={`${ae}-${date}-tr`} className="px-4 py-2.5 text-center text-[length:var(--text-body-sm)] font-bold text-primary/60 border-r border-outline-variant/40 italic">{s ? fmt(s.totalRate) : '-'}</td>,
                  ];
                })}
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
