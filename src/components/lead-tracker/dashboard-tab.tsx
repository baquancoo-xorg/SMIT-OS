import { useMemo } from 'react';
import { ArrowDownToLine, CheckCheck, Layers, Percent, ArrowUpRight, TrendingUp, AlertCircle } from 'lucide-react';
import { useLeadFlow } from '../../hooks/use-lead-flow';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { GlassCard, KpiCard, Spinner, EmptyState } from '../ui';

/**
 * Dashboard Sale tab — Lead Flow & Clearance section.
 *
 * Phase 8 follow-up batch 8 (2026-05-10): migrated to v2 KpiCard (Bento decorative)
 * + GlassCard wrappers + Spinner + EmptyState. Recharts internals giữ nguyên.
 *
 * Replaces inline KPICard + ClearanceRateCard helpers (kept Clearance progress
 * inline because v2 KpiCard không có progress bar slot — defer pending design).
 */

interface Props {
  dateFrom: string;
  dateTo: string;
}

function dayLabel(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function DashboardTab({ dateFrom, dateTo }: Props) {
  const { data, isLoading, error } = useLeadFlow({ from: dateFrom, to: dateTo });

  const weekData = useMemo(() => {
    if (!data?.daily) return [];
    return data.daily.map((d) => ({
      day: dayLabel(d.date),
      inflow: d.inflow,
      cleared: d.cleared,
      activeBacklog: d.activeBacklog,
    }));
  }, [data?.daily]);

  const trendData = useMemo(() => {
    if (!data?.daily) return [];
    return data.daily.map((d) => ({
      date: dayLabel(d.date),
      remaining: d.activeBacklog,
    }));
  }, [data?.daily]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle />}
        title="Failed to load data"
        description="Lead flow data unavailable. Try refreshing the page."
        variant="card"
      />
    );
  }

  const { summary } = data ?? { summary: { inflow: 0, cleared: 0, activeBacklog: 0, clearanceRate: null } };

  return (
    <div className="space-y-4">
      {/* KPI cards — Lead Flow & Clearance */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Inflow" value={summary.inflow} unit="leads" icon={<ArrowDownToLine />} accent="info" />
        <KpiCard label="Cleared" value={summary.cleared} unit="leads" icon={<CheckCheck />} accent="success" />
        <KpiCard label="Active Backlog" value={summary.activeBacklog} unit="leads" icon={<Layers />} accent="warning" />
        <ClearanceRateCard rate={summary.clearanceRate} />
      </div>

      {/* Charts — side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard variant="surface" padding="md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                Weekly Performance
              </h3>
              <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
                Inflow vs Cleared vs Active Backlog
              </p>
            </div>
            <div className="flex size-7 items-center justify-center rounded-button bg-surface-container text-on-surface-variant">
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
        </GlassCard>

        <GlassCard variant="surface" padding="md">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                Backlog Trend
              </h3>
              <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
                Unresolved leads end-of-day
              </p>
            </div>
            <div className="flex size-7 items-center justify-center rounded-button bg-surface-container text-on-surface-variant">
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
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="remaining" name="Backlog" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function ClearanceRateCard({ rate }: { rate: number | null }) {
  const displayRate = rate !== null ? `${rate}%` : '—';
  const barWidth = rate !== null ? Math.min(rate, 100) : 0;

  return (
    <GlassCard variant="surface" padding="md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-button bg-warning-container text-on-warning-container">
            <Percent size={18} />
          </div>
          <div>
            <p className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface">
              Clearance Rate
            </p>
            <p className="mt-0.5 text-[length:var(--text-caption)] font-medium text-on-surface-variant">
              Cleared / (Cleared + Backlog)
            </p>
          </div>
        </div>
        <span className="font-headline text-[length:var(--text-h4)] font-bold text-warning">{displayRate}</span>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-chip bg-warning-container/40">
        <div
          className="h-1.5 rounded-chip bg-warning transition-all duration-500"
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </GlassCard>
  );
}
