import { useState } from 'react';
import { format, subDays } from 'date-fns';
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

function DashboardOverviewContent() {
  const [range, setRange] = useState({
    from: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data, isLoading, error } = useOverviewAll({ from: range.from, to: range.to });

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-10 w-full">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span>Analytics</span>
            <span className="text-slate-300">›</span>
            <span className="text-on-surface">Dashboard</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Dashboard <span className="text-[#7C3AED] italic">Overview</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={range} onChange={setRange} />
        </div>
      </section>

      <SummaryCards
        data={data?.summary}
        isLoading={isLoading}
        error={error as Error | null}
        compareEnabled={true}
      />

      <KpiTable data={data?.kpiMetrics} isLoading={isLoading} error={error as Error | null} />
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
