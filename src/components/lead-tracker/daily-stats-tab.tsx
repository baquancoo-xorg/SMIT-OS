import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { LeadDailyStat } from '../../types';
import { TableShell } from '../ui/TableShell';
import { getTableContract } from '../ui/table-contract';
import { formatTableDate } from '../ui/table-date-format';

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
        <TableShell variant="standard" className="border border-slate-100" scrollClassName="max-h-[70vh] overflow-y-auto overflow-x-auto custom-scrollbar">
          <thead>
            <tr className={`${standardTable.headerRow} bg-white`}>
              <th className={`${standardTable.headerCell} sticky top-0 z-30 border-r border-slate-100/50 bg-white`} rowSpan={2}>Date</th>
              {aeList.map((ae) => (
                <th key={ae} colSpan={5} className="sticky top-0 z-30 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.2em] text-primary bg-white border-b border-r border-slate-200">
                  {ae}
                </th>
              ))}
            </tr>
            <tr className="bg-white border-b border-slate-100">
              {aeList.flatMap((ae) => [
                <th key={`${ae}-add`} className="sticky top-[46px] z-30 px-3 py-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100/50 bg-white">New</th>,
                <th key={`${ae}-proc`} className="sticky top-[46px] z-30 px-3 py-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100/50 bg-white">Done</th>,
                <th key={`${ae}-rem`} className="sticky top-[46px] z-30 px-3 py-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100/50 bg-white">Remaining</th>,
                <th key={`${ae}-dr`} className="sticky top-[46px] z-30 px-3 py-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100/50 bg-white">Daily%</th>,
                <th key={`${ae}-tr`} className="sticky top-[46px] z-30 px-3 py-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-200 bg-white">Total%</th>,
              ])}
            </tr>
          </thead>
          <tbody className={standardTable.body}>
            {dateList.length === 0 && (
              <tr>
                <td colSpan={1 + aeList.length * 5} className={standardTable.emptyState}>
                  <p className="font-black uppercase tracking-widest text-xs opacity-30">No data for this period</p>
                </td>
              </tr>
            )}
            {dateList.map((date) => (
              <tr key={date} className={standardTable.row}>
                <td className={`${standardTable.cell} font-black text-slate-700 text-xs border-r border-slate-100/50 bg-slate-50/30`}>{formatTableDate(date)}</td>
                {aeList.flatMap((ae) => {
                  const s = lookup.get(`${ae}|${date}`);
                  const isHighRemaining = (s?.remaining ?? 0) > 10;
                  return [
                    <td key={`${ae}-${date}-add`} className="px-3 py-3 text-center text-xs font-bold text-slate-600 border-r border-slate-100/50">{s?.added ?? 0}</td>,
                    <td key={`${ae}-${date}-proc`} className="px-3 py-3 text-center text-xs font-bold text-emerald-600 border-r border-slate-100/50">{s?.processed ?? 0}</td>,
                    <td key={`${ae}-${date}-rem`} className={`px-3 py-3 text-center text-xs font-black border-r border-slate-100/50 ${isHighRemaining ? 'text-rose-500' : 'text-slate-900'}`}>{s?.remaining ?? 0}</td>,
                    <td key={`${ae}-${date}-dr`} className="px-3 py-3 text-center text-xs font-bold text-slate-400 border-r border-slate-100/50 italic">{s ? fmt(s.dailyRate) : '-'}</td>,
                    <td key={`${ae}-${date}-tr`} className="px-3 py-3 text-center text-xs font-bold text-primary/60 border-r border-slate-200 italic">{s ? fmt(s.totalRate) : '-'}</td>,
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
