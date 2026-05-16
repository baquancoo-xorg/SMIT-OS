import { useMemo } from 'react';
import { Activity, BarChart3, Briefcase, Megaphone, Monitor, PhoneCall, Users } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { DateRangePicker, PageSectionStack, PageToolbar, TabPill } from '../components/ui';
import type { DateRange, TabPillItem } from '../components/ui';
import { useOverviewAll } from '../hooks/use-overview-data';
import CallPerformanceSection from '../components/features/dashboard/call-performance/call-performance-section';
import { LeadDistributionSection } from '../components/features/dashboard/lead-distribution';
import AcquisitionOverviewTab from '../components/features/dashboard/acquisition-overview/acquisition-overview-tab';
import { KpiTable } from '../components/features/dashboard/overview/kpi-table';
import DashboardTab from '../components/features/leads/dashboard-tab';
import MarketingTab from '../components/features/dashboard/marketing/marketing-tab';
import MediaTab from '../components/features/dashboard/media/media-tab';
import { ProductSection } from '../components/features/dashboard/product';
import { SummaryCards } from '../components/features/dashboard/overview/summary-cards';

type DashboardTab = 'overview' | 'acquisition' | 'call' | 'distribution' | 'marketing' | 'media' | 'product';

const tabs: TabPillItem<DashboardTab>[] = [
  { value: 'overview', label: 'Overview', icon: <Activity /> },
  { value: 'acquisition', label: 'Acquisition', icon: <BarChart3 /> },
  { value: 'call', label: 'Call', icon: <PhoneCall /> },
  { value: 'distribution', label: 'Distribution', icon: <Users /> },
  { value: 'marketing', label: 'Marketing', icon: <Megaphone /> },
  { value: 'media', label: 'Media', icon: <Monitor /> },
  { value: 'product', label: 'Product', icon: <Briefcase /> },
];

const validTabs = new Set<DashboardTab>(tabs.map((tab) => tab.value));

function parseTab(raw: string | null): DashboardTab {
  if (raw && validTabs.has(raw as DashboardTab)) return raw as DashboardTab;
  return 'overview';
}

function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function rangeToDateValue(from: string, to: string): DateRange {
  return { from: parseLocalDate(from), to: parseLocalDate(to) };
}

export default function DashboardOverviewV5() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = parseTab(searchParams.get('tab'));

  const defaultFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const defaultTo = format(new Date(), 'yyyy-MM-dd');
  const from = searchParams.get('date_from') ?? defaultFrom;
  const to = searchParams.get('date_to') ?? defaultTo;
  const pickerValue = useMemo(() => rangeToDateValue(from, to), [from, to]);

  const { data, isLoading, error } = useOverviewAll({ from, to });

  const setRange = (next: DateRange) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('date_from', format(next.from, 'yyyy-MM-dd'));
    nextParams.set('date_to', format(next.to, 'yyyy-MM-dd'));
    setSearchParams(nextParams);
  };

  const setTab = (tab: DashboardTab) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === 'overview') nextParams.delete('tab');
    else nextParams.set('tab', tab);
    setSearchParams(nextParams);
  };

  return (
    <PageSectionStack>
      <PageToolbar
        left={
          <div className="overflow-x-auto pb-1">
            <TabPill<DashboardTab>
              label="Command Center tabs"
              value={selectedTab}
              onChange={setTab}
              items={tabs}
              size="page"
              className="min-w-max"
            />
          </div>
        }
        right={<DateRangePicker value={pickerValue} onChange={setRange} size="sm" label="Dashboard date range" />}
      />

      <section className="flex-1 space-y-5" aria-label="Dashboard content">
        {selectedTab === 'overview' && (
          <>
            <SummaryCards data={data?.summary} isLoading={isLoading} error={error as Error | null} />
            <KpiTable data={data?.kpiMetrics} isLoading={isLoading} error={error as Error | null} />
          </>
        )}

        {selectedTab === 'acquisition' && <AcquisitionOverviewTab from={from} to={to} />}
        {selectedTab === 'call' && <CallPerformanceSection from={from} to={to} />}
        {selectedTab === 'distribution' && (
          <>
            <DashboardTab dateFrom={from} dateTo={to} />
            <LeadDistributionSection from={from} to={to} />
          </>
        )}
        {selectedTab === 'marketing' && <MarketingTab from={from} to={to} />}
        {selectedTab === 'media' && <MediaTab from={from} to={to} />}
        {selectedTab === 'product' && <ProductSection from={from} to={to} />}
      </section>
    </PageSectionStack>
  );
}
