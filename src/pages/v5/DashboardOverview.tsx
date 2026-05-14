import { useMemo } from 'react';
import { Activity, BarChart3, Briefcase, Megaphone, Monitor, PhoneCall, Users } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { DateRangePicker, TabPill } from '../../components/v5/ui';
import type { DateRange, TabPillItem } from '../../components/v5/ui';
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
} from '../../components/v5/dashboard';

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
    <div className="flex h-full flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <DateRangePicker value={pickerValue} onChange={setRange} size="sm" label="Dashboard date range" />
      </div>

      <div className="overflow-x-auto pb-1">
        <TabPill<DashboardTab>
          label="Command Center tabs"
          value={selectedTab}
          onChange={setTab}
          items={tabs}
          size="sm"
          className="min-w-max"
        />
      </div>

      <section className="flex-1 space-y-5" aria-label="Dashboard content">
        {selectedTab === 'overview' && (
          <>
            <SummaryCardsV5 data={data?.summary} isLoading={isLoading} error={error as Error | null} />
            <JourneyFunnelV5 from={from} to={to} />
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
      </section>
    </div>
  );
}
