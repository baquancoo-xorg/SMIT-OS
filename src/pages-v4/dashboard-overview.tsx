/**
 * v4 DashboardOverview — simplified KPI-focused page.
 * Real data via existing useSummaryData hook. Complex sub-sections deferred.
 */
import { useMemo, useState } from 'react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import {
  Badge,
  Button,
  DateRangePicker,
  EmptyState,
  KpiCard,
  PageHeader,
  Spinner,
  SurfaceCard,
  TabPill,
  type DateRange,
} from '../design/v4/index.js';
import { Activity, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useSummaryData } from '../hooks/use-overview-data';

type DomainTab = 'overview' | 'sale' | 'marketing' | 'media';

const TABS = [
  { value: 'overview' as DomainTab, label: 'Overview' },
  { value: 'sale' as DomainTab, label: 'Sale' },
  { value: 'marketing' as DomainTab, label: 'Marketing' },
  { value: 'media' as DomainTab, label: 'Media' },
];

function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US').format(n);
}

function formatCurrency(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function deltaToBadge(curr: number | null | undefined, prev: number | null | undefined): { delta: string; trend: 'up' | 'down' | 'flat' } | null {
  if (curr == null || prev == null || prev === 0) return null;
  const pct = ((curr - prev) / prev) * 100;
  const trend = pct > 0.1 ? 'up' : pct < -0.1 ? 'down' : 'flat';
  return { delta: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, trend };
}

export default function DashboardOverviewV4() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<DomainTab>('overview');

  const defaultFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const defaultTo = format(new Date(), 'yyyy-MM-dd');

  const urlFrom = searchParams.get('date_from') ?? defaultFrom;
  const urlTo = searchParams.get('date_to') ?? defaultTo;
  const range: DateRange = { from: urlFrom, to: urlTo };

  // Previous period for delta comparison
  const prevRange = useMemo(() => {
    const fromDate = new Date(urlFrom);
    return {
      previousFrom: format(subMonths(fromDate, 1), 'yyyy-MM-dd'),
      previousTo: format(subMonths(new Date(urlTo), 1), 'yyyy-MM-dd'),
    };
  }, [urlFrom, urlTo]);

  const summary = useSummaryData({ from: urlFrom, to: urlTo, ...prevRange });

  const onRangeChange = (next: DateRange) => {
    const p = new URLSearchParams(searchParams);
    p.set('date_from', next.from);
    p.set('date_to', next.to);
    setSearchParams(p);
  };

  const kpis = useMemo(() => {
    const data = summary.data as any;
    if (!data) return [];
    const pick = (key: string) => {
      const slot = data[key];
      if (slot && typeof slot === 'object' && 'current' in slot) return slot;
      return { current: data[key], previous: undefined };
    };
    const revenue = pick('totalRevenue');
    const leads = pick('totalLeads');
    const conv = pick('conversionRate');
    const users = pick('activeUsers');
    return [
      { label: 'Total Revenue', value: formatCurrency(revenue.current), icon: <DollarSign size={16} />, ...(deltaToBadge(revenue.current, revenue.previous) ?? {}) },
      { label: 'Total Leads', value: formatNumber(leads.current), icon: <Users size={16} />, ...(deltaToBadge(leads.current, leads.previous) ?? {}) },
      { label: 'Conversion Rate', value: typeof conv.current === 'number' ? `${conv.current.toFixed(1)}%` : '—', icon: <TrendingUp size={16} />, ...(deltaToBadge(conv.current, conv.previous) ?? {}) },
      { label: 'Active Users', value: formatNumber(users.current), icon: <Activity size={16} />, ...(deltaToBadge(users.current, users.previous) ?? {}) },
    ];
  }, [summary.data]);

  return (
    <div className="flex flex-col gap-comfy">
      <PageHeader
                subtitle={`${urlFrom} → ${urlTo}`}
        actions={
          <>
            <TabPill value={tab} onChange={(v) => setTab(v as DomainTab)} items={TABS} size="sm" />
            <Button variant="secondary" size="sm">Export</Button>
          </>
        }
      />

      <SurfaceCard padding="sm" className="flex flex-wrap items-center gap-comfy">
        <span className="text-body-sm text-fg-muted">Date range</span>
        <DateRangePicker
          value={range}
          onChange={onRangeChange}
          presets={[
            { label: 'MTD', range: () => ({ from: defaultFrom, to: defaultTo }) },
            { label: 'Last 30d', range: () => ({ from: format(subMonths(new Date(), 1), 'yyyy-MM-dd'), to: defaultTo }) },
          ]}
        />
      </SurfaceCard>

      {tab === 'overview' && (
        <>
          {summary.isLoading ? (
            <div className="flex items-center justify-center py-vast">
              <Spinner size="lg" accent />
            </div>
          ) : summary.error ? (
            <SurfaceCard padding="md">
              <Badge intent="error">Failed to load</Badge>
              <p className="mt-snug text-body-sm text-fg-muted">{(summary.error as Error).message}</p>
            </SurfaceCard>
          ) : kpis.length === 0 ? (
            <EmptyState
              title="No data for this range"
              description="Pick a different date range to see metrics."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-comfy">
              {kpis.map((k) => (
                <KpiCard
                  key={k.label}
                  label={k.label}
                  value={k.value}
                  icon={k.icon}
                  delta={k.delta}
                  trend={k.trend}
                  meta="vs previous period"
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab !== 'overview' && (
        <SurfaceCard padding="md">
          <EmptyState
            title={`${tab.charAt(0).toUpperCase() + tab.slice(1)} view`}
            description="This domain view will be migrated in a future iteration. The v4 design system foundation is established; sub-domain analytics will be ported incrementally."
            action={<Button variant="ghost" onClick={() => setTab('overview')}>Back to Overview</Button>}
          />
        </SurfaceCard>
      )}
    </div>
  );
}
