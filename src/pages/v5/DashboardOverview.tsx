import { Suspense, useMemo } from 'react';
import { Activity, BarChart3, Briefcase, Megaphone, Monitor, PhoneCall, Users, Users2 } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { DateRangePicker } from '../../components/ui/date-range-picker';
import { PageSectionStack } from '../../components/ui/page-section-stack';
import { PageToolbar } from '../../components/ui/page-toolbar';
import { Skeleton } from '../../components/ui/skeleton';
import { TabPill } from '../../components/ui/tab-pill';
import type { DateRange } from '../../components/ui/date-range-picker';
import type { TabPillItem } from '../../components/ui/tab-pill';
import { useOverviewAll } from '../../hooks/use-overview-data';
import {
  CallPerfSectionV5,
  DistributionSectionV5,
  JourneyFunnelV5,
  KpiTableV5,
  LeadFlowPanelV5,
  MarketingTabV5,
  MediaTabV5,
  ProductTabV5,
  SummaryCardsV5,
} from '../../components/workspace/dashboard';
import { PeopleTabV5 } from '../../components/workspace/dashboard/people-tab-v5';

type DashboardTab = 'overview' | 'acquisition' | 'call' | 'distribution' | 'marketing' | 'media' | 'product' | 'people';

const tabs: TabPillItem<DashboardTab>[] = [
  { value: 'overview', label: 'Overview', icon: <Activity /> },
  { value: 'acquisition', label: 'Acquisition', icon: <BarChart3 /> },
  { value: 'call', label: 'Call', icon: <PhoneCall /> },
  { value: 'distribution', label: 'Distribution', icon: <Users /> },
  { value: 'marketing', label: 'Marketing', icon: <Megaphone /> },
  { value: 'media', label: 'Media', icon: <Monitor /> },
  { value: 'product', label: 'Product', icon: <Briefcase /> },
  { value: 'people', label: 'People', icon: <Users2 /> },
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
            <SummaryCardsV5 data={data?.summary} isLoading={isLoading} error={error as Error | null} />
            <KpiTableV5 data={data?.kpiMetrics} isLoading={isLoading} error={error as Error | null} />
          </>
        )}

        {selectedTab === 'acquisition' && <JourneyFunnelV5 from={from} to={to} />}
        {selectedTab === 'call' && <CallPerfSectionV5 from={from} to={to} />}
        {selectedTab === 'distribution' && (
          <>
            <LeadFlowPanelV5 from={from} to={to} />
            <DistributionSectionV5 from={from} to={to} />
          </>
        )}
        {selectedTab === 'marketing' && <MarketingTabV5 from={from} to={to} />}
        {selectedTab === 'media' && <MediaTabV5 from={from} to={to} />}
        {selectedTab === 'product' && <ProductTabV5 from={from} to={to} />}
        {selectedTab === 'people' && (
          <Suspense fallback={<Skeleton variant="rect" className="h-64 w-full rounded-[var(--radius-card)]" />}>
            <PeopleTabV5 />
          </Suspense>
        )}
      </section>
    </PageSectionStack>
  );
}
