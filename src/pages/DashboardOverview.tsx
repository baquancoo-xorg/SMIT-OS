import { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { DateRangePicker } from '../components/dashboard/overview/DateRangePicker';
import { SummaryCards } from '../components/dashboard/overview/SummaryCards';
import { KpiTable } from '../components/dashboard/overview/KpiTable';
import { useOverviewAll } from '../hooks/use-overview-data';
import DashboardTab from '../components/lead-tracker/dashboard-tab';

type ViewMode = 'realtime' | 'cohort';

export default function DashboardOverview() {
  const [range, setRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [viewMode, setViewMode] = useState<ViewMode>('realtime');

  const { data, isLoading, error } = useOverviewAll({
    from: range.from,
    to: range.to,
    viewMode,
  });

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Analytics</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Dashboard</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Overview <span className="text-primary italic">Dashboard</span>
          </h2>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </section>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto pb-8 space-y-[var(--space-lg)]">
        {/* Summary Cards */}
        <SummaryCards
          data={data?.summary}
          isLoading={isLoading}
          error={error as Error | null}
          compareEnabled={true}
        />

        {/* KPI Table */}
        <KpiTable
          data={data?.kpiMetrics}
          isLoading={isLoading}
          error={error as Error | null}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* CRM Performance */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#0059B6] rounded-full" />
            Lead Flow & Clearance
          </h2>
          <DashboardTab dateFrom={range.from} dateTo={range.to} />
        </section>
      </div>
    </div>
  );
}

