import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import type { Lead } from '../../types';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function getMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);
  return { from, to };
}

function getWeekKey(dateStr: string) {
  const d = new Date(dateStr);
  const week = Math.ceil(d.getDate() / 7);
  return `T${d.getMonth() + 1}/W${week}`;
}

export default function DashboardTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const def = getMonthRange();
  const [dateFrom, setDateFrom] = useState(def.from);
  const [dateTo, setDateTo] = useState(def.to);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const data = await api.getLeads(params);
      setLeads(data);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const qualified = leads.filter((l) => l.status === 'Qualified').length;
  const unqualified = leads.filter((l) => l.status === 'Unqualified').length;
  const pending = leads.filter((l) => l.status !== 'Qualified' && l.status !== 'Unqualified').length;

  // Weekly bar chart: added vs processed per week, per AE
  const weekMap = new Map<string, { week: string; added: number; processed: number }>();
  leads.forEach((l) => {
    const wk = getWeekKey(l.receivedDate.slice(0, 10));
    if (!weekMap.has(wk)) weekMap.set(wk, { week: wk, added: 0, processed: 0 });
    weekMap.get(wk)!.added++;
    if (l.resolvedDate && (l.status === 'Qualified' || l.status === 'Unqualified')) {
      const rwk = getWeekKey(l.resolvedDate.slice(0, 10));
      if (!weekMap.has(rwk)) weekMap.set(rwk, { week: rwk, added: 0, processed: 0 });
      weekMap.get(rwk)!.processed++;
    }
  });
  const weekData = [...weekMap.values()].sort((a, b) => a.week.localeCompare(b.week));

  // Remaining trend (cumulative by date)
  const dateMap = new Map<string, number>();
  let remaining = 0;
  const sortedByDate = [...leads].sort((a, b) => a.receivedDate.localeCompare(b.receivedDate));
  sortedByDate.forEach((l) => {
    const d = l.receivedDate.slice(0, 10);
    if (!dateMap.has(d)) dateMap.set(d, 0);
  });
  [...dateMap.keys()].sort().forEach((d) => {
    const added = leads.filter((l) => l.receivedDate.slice(0, 10) === d).length;
    const processed = leads.filter(
      (l) => l.resolvedDate?.slice(0, 10) === d && (l.status === 'Qualified' || l.status === 'Unqualified')
    ).length;
    remaining = remaining + added - processed;
    dateMap.set(d, remaining);
  });
  const trendData = [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rem]) => ({ date, remaining: rem }));

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-center">
        <label className="text-sm text-slate-500">Từ</label>
        <input type="date" className="border border-slate-200 rounded-xl px-3 py-2 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <label className="text-sm text-slate-500">đến</label>
        <input type="date" className="border border-slate-200 rounded-xl px-3 py-2 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-xs font-medium text-slate-500 mb-1">Qualified</p>
              <p className="text-3xl font-bold text-emerald-600">{qualified}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-xs font-medium text-slate-500 mb-1">Unqualified</p>
              <p className="text-3xl font-bold text-red-500">{unqualified}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-xs font-medium text-slate-500 mb-1">Đang xử lý</p>
              <p className="text-3xl font-bold text-amber-500">{pending}</p>
            </div>
          </div>

          {/* Bar chart: added vs processed by week */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Thêm mới vs Xử lý theo tuần</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="added" name="Thêm mới" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="processed" name="Xử lý" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart: remaining trend */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Tồn cuối ngày</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="remaining" name="Tồn" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
