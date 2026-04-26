import { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { DateRangePicker } from '../components/dashboard/overview/DateRangePicker';
import { SummaryCards } from '../components/dashboard/overview/SummaryCards';
import { KpiTable } from '../components/dashboard/overview/KpiTable';
import { useOverviewAll } from '../hooks/use-overview-data';
import CallPerformanceSection from '../components/dashboard/call-performance/call-performance-section';
import DashboardTab from '../components/lead-tracker/dashboard-tab';
import {
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardSectionTitle,
  SegmentedTabs,
} from '../components/dashboard/ui';

type ViewMode = 'realtime' | 'cohort';
type DashboardDomainTab = 'overview' | 'sale' | 'product' | 'marketing' | 'media';

const TAB_OPTIONS: Array<{ label: string; value: DashboardDomainTab }> = [
  { label: 'Overview', value: 'overview' },
  { label: 'Sale', value: 'sale' },
  { label: 'Product', value: 'product' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Media', value: 'media' },
];

const VALID_TABS = new Set<DashboardDomainTab>(TAB_OPTIONS.map((item) => item.value));

function parseDashboardTab(raw: string | null): DashboardDomainTab {
  if (raw && VALID_TABS.has(raw as DashboardDomainTab)) {
    return raw as DashboardDomainTab;
  }

  return 'overview';
}

export default function DashboardOverview() {
  const [range, setRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [viewMode, setViewMode] = useState<ViewMode>('realtime');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = parseDashboardTab(searchParams.get('tab'));

  const { data, isLoading, error } = useOverviewAll({
    from: range.from,
    to: range.to,
    viewMode,
  });

  const handleTabChange = (tab: DashboardDomainTab) => {
    const next = new URLSearchParams(searchParams);

    if (tab === 'overview') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }

    setSearchParams(next);
  };

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      <DashboardPageHeader
        breadcrumb={[
          { label: 'Analytics' },
          { label: 'Dashboard', active: true },
        ]}
        title="Overview"
        accent="Dashboard"
        rightControls={
          <div className="flex flex-wrap items-center justify-end gap-3 md:gap-4">
            <div className="max-w-full">
              <SegmentedTabs value={selectedTab} onChange={handleTabChange} options={TAB_OPTIONS} />
            </div>
            <DateRangePicker value={range} onChange={setRange} />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto pb-8 space-y-[var(--space-lg)]">
        {selectedTab === 'overview' && (
          <>
            <SummaryCards
              data={data?.summary}
              isLoading={isLoading}
              error={error as Error | null}
              compareEnabled={true}
            />

            <KpiTable
              data={data?.kpiMetrics}
              isLoading={isLoading}
              error={error as Error | null}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </>
        )}

        {selectedTab === 'sale' && (
          <>
            <CallPerformanceSection from={range.from} to={range.to} />

            <section className="space-y-3">
              <DashboardSectionTitle>Lead Flow & Clearance</DashboardSectionTitle>
              <DashboardTab dateFrom={range.from} dateTo={range.to} />
            </section>
          </>
        )}

        {selectedTab === 'product' && (
          <DashboardEmptyState description="Dashboard cho Product đang được chuẩn bị." />
        )}

        {selectedTab === 'marketing' && (
          <DashboardEmptyState description="Dashboard cho Marketing đang được chuẩn bị." />
        )}

        {selectedTab === 'media' && (
          <DashboardEmptyState description="Dashboard cho Media đang được chuẩn bị." />
        )}
      </div>
    </div>
  );
}

