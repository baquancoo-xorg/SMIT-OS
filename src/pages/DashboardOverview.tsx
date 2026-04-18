import { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DateRangePicker } from '../components/dashboard/overview/DateRangePicker';
import { SummaryCards } from '../components/dashboard/overview/SummaryCards';
import { KpiTable } from '../components/dashboard/overview/KpiTable';
import { useOverviewAll } from '../hooks/use-overview-data';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type ViewMode = 'realtime' | 'cohort';

function DashboardOverviewContent() {
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
    <div className="h-full flex flex-col py-6 lg:py-10 space-y-8 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      </div>

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
    </div>
  );
}

export default function DashboardOverview() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardOverviewContent />
    </QueryClientProvider>
  );
}
