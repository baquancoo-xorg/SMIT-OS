import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDownToLine, CheckCheck, Layers, Percent, ArrowUpRight, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';
import type { Lead } from '../../types';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function getWeekKey(dateStr: string) {
  const d = new Date(dateStr);
  const week = Math.ceil(d.getDate() / 7);
  return `M${d.getMonth() + 1}/W${week}`;
}

const CLEARED_STATUSES = ['Qualified', 'Unqualified'];

interface Props {
  dateFrom: string;
  dateTo: string;
}

export default function DashboardTab({ dateFrom, dateTo }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

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

  const inflow = leads.length;
  const cleared = leads.filter((l) => CLEARED_STATUSES.includes(l.status)).length;
  const activeBacklog = leads.filter((l) => !CLEARED_STATUSES.includes(l.status)).length;
  const clearanceRate = inflow > 0 ? Math.round((cleared / inflow) * 100) : 0;

  // Build last-7-days buckets from dateTo (or today) going back 6 days
  const baseDate = dateTo ? new Date(dateTo) : new Date();
  const last7Days: string[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const dayLabel = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };
  const dailyMap = new Map<string, { day: string; inflow: number; cleared: number; activeBacklog: number }>();
  last7Days.forEach((iso) => dailyMap.set(iso, { day: dayLabel(iso), inflow: 0, cleared: 0, activeBacklog: 0 }));
  leads.forEach((l) => {
    const rd = l.receivedDate.slice(0, 10);
    if (dailyMap.has(rd)) dailyMap.get(rd)!.inflow++;
    if (l.resolvedDate && CLEARED_STATUSES.includes(l.status)) {
      const res = l.resolvedDate.slice(0, 10);
      if (dailyMap.has(res)) dailyMap.get(res)!.cleared++;
    }
  });
  // Active backlog end-of-day: leads received on or before day that are not yet cleared
  last7Days.forEach((iso) => {
    const entry = dailyMap.get(iso)!;
    entry.activeBacklog = leads.filter(
      (l) =>
        l.receivedDate.slice(0, 10) <= iso &&
        (!CLEARED_STATUSES.includes(l.status) || !l.resolvedDate || l.resolvedDate.slice(0, 10) > iso)
    ).length;
  });
  const weekData = last7Days.map((iso) => dailyMap.get(iso)!);

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
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* KPI cards — Lead Flow & Clearance */}
          <div className="grid grid-cols-4 gap-3">
            <KPICard
              label="Inflow"
              value={inflow}
              icon={<ArrowDownToLine size={18} className="text-blue-500" />}
              color="blue"
              desc="Leads received"
            />
            <KPICard
              label="Cleared"
              value={cleared}
              icon={<CheckCheck size={18} className="text-emerald-500" />}
              color="emerald"
              desc="Leads resolved"
            />
            <KPICard
              label="Active Backlog"
              value={activeBacklog}
              icon={<Layers size={18} className="text-amber-500" />}
              color="amber"
              desc="Pending"
            />
            <ClearanceRateCard rate={clearanceRate} />
          </div>

          {/* Charts — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Weekly Performance</h3>
                  <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">Inflow vs Cleared vs Active Backlog</p>
                </div>
                <div className="size-7 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
                  <ArrowUpRight size={14} />
                </div>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '10px' }} />
                    <Bar dataKey="inflow" name="Inflow" fill="#0059b6" radius={[4, 4, 0, 0]} barSize={14} />
                    <Bar dataKey="cleared" name="Cleared" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
                    <Bar dataKey="activeBacklog" name="Active Backlog" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Backlog Trend</h3>
                  <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">Unresolved leads end-of-day</p>
                </div>
                <div className="size-7 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
                  <TrendingUp size={14} />
                </div>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 0, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="remaining" name="Backlog" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ label, value, icon, color, desc }: { label: string; value: number; icon: React.ReactNode; color: string; desc: string }) {
  const colorBg: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    rose: 'bg-rose-50 border-rose-100',
    amber: 'bg-amber-50 border-amber-100',
  };

  return (
    <div className={`p-4 rounded-2xl border ${colorBg[color]} flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <div className="size-8 bg-white rounded-xl shadow-sm flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-700">{label}</p>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-2xl font-black text-slate-900 tracking-tighter">{value}</span>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">leads</p>
      </div>
    </div>
  );
}

function ClearanceRateCard({ rate }: { rate: number }) {
  return (
    <div className="p-4 rounded-2xl border bg-orange-50 border-orange-100 flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <Percent size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-700">Clearance Rate</p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Cleared / Inflow</p>
          </div>
        </div>
        <span className="text-2xl font-black text-orange-500 tracking-tighter">{rate}%</span>
      </div>
      <div className="w-full bg-orange-100 rounded-full h-1.5">
        <div
          className="bg-orange-400 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
    </div>
  );
}
