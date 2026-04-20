import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import type { LeadDailyStat } from '../../types';

function fmt(rate: number | null) {
  if (rate === null) return '-';
  return `${Math.round(rate * 100)}%`;
}

function getMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);
  return { from, to };
}

export default function DailyStatsTab() {
  const [stats, setStats] = useState<LeadDailyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const def = getMonthRange();
  const [dateFrom, setDateFrom] = useState(def.from);
  const [dateTo, setDateTo] = useState(def.to);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const data = await api.getLeadDailyStats(params);
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const aeList = [...new Set(stats.map((s) => s.ae))].sort();
  const dateList = [...new Set(stats.map((s) => s.date))].sort();
  const lookup = new Map<string, LeadDailyStat>();
  stats.forEach((s) => lookup.set(`${s.ae}|${s.date}`, s));

  return (
    <div>
      <div className="flex gap-3 mb-4 items-center">
        <label className="text-sm text-slate-500">Từ</label>
        <input
          type="date"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <label className="text-sm text-slate-500">đến</label>
        <input
          type="date"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 px-3 py-2 text-left font-medium text-slate-600" rowSpan={2}>Ngày</th>
                {aeList.map((ae) => (
                  <th key={ae} colSpan={5} className="border border-slate-200 px-3 py-2 text-center font-semibold text-slate-700">{ae}</th>
                ))}
              </tr>
              <tr className="bg-slate-50">
                {aeList.flatMap((ae) => [
                  <th key={`${ae}-add`} className="border border-slate-200 px-2 py-1.5 text-center font-medium text-slate-500">Thêm</th>,
                  <th key={`${ae}-proc`} className="border border-slate-200 px-2 py-1.5 text-center font-medium text-slate-500">Xử lý</th>,
                  <th key={`${ae}-rem`} className="border border-slate-200 px-2 py-1.5 text-center font-medium text-slate-500">Tồn</th>,
                  <th key={`${ae}-dr`} className="border border-slate-200 px-2 py-1.5 text-center font-medium text-slate-500">Tỷ lệ/ngày</th>,
                  <th key={`${ae}-tr`} className="border border-slate-200 px-2 py-1.5 text-center font-medium text-slate-500">Tỷ lệ/tổng</th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {dateList.length === 0 && (
                <tr><td colSpan={1 + aeList.length * 5} className="py-8 text-center text-slate-400">Không có dữ liệu</td></tr>
              )}
              {dateList.map((date) => (
                <tr key={date} className="hover:bg-slate-50">
                  <td className="border border-slate-200 px-3 py-2 font-medium text-slate-700">{date}</td>
                  {aeList.flatMap((ae) => {
                    const s = lookup.get(`${ae}|${date}`);
                    return [
                      <td key={`${ae}-${date}-add`} className="border border-slate-200 px-2 py-2 text-center text-slate-600">{s?.added ?? 0}</td>,
                      <td key={`${ae}-${date}-proc`} className="border border-slate-200 px-2 py-2 text-center text-slate-600">{s?.processed ?? 0}</td>,
                      <td key={`${ae}-${date}-rem`} className="border border-slate-200 px-2 py-2 text-center font-medium text-slate-700">{s?.remaining ?? 0}</td>,
                      <td key={`${ae}-${date}-dr`} className="border border-slate-200 px-2 py-2 text-center text-slate-500">{s ? fmt(s.dailyRate) : '-'}</td>,
                      <td key={`${ae}-${date}-tr`} className="border border-slate-200 px-2 py-2 text-center text-slate-500">{s ? fmt(s.totalRate) : '-'}</td>,
                    ];
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
