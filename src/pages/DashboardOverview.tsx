import { useState, type ReactNode } from 'react';
import { Activity, Briefcase, Monitor, TrendingUp, Users } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { DateRangePicker as V1DateRangePicker } from '../components/dashboard/overview/DateRangePicker';
import { SummaryCards } from '../components/dashboard/overview/SummaryCards';
import { KpiTable } from '../components/dashboard/overview/KpiTable';
import { useOverviewAll } from '../hooks/use-overview-data';
import CallPerformanceSection from '../components/dashboard/call-performance/call-performance-section';
import DashboardTab from '../components/lead-tracker/dashboard-tab';
import { LeadDistributionSection } from '../components/dashboard/lead-distribution';
import { ProductSection } from '../components/dashboard/product';
import MarketingTab from '../components/dashboard/marketing/marketing-tab';
import MediaTab from '../components/dashboard/media/media-tab';
import AcquisitionOverviewTab from '../components/dashboard/acquisition-overview/acquisition-overview-tab';
import { TabPill, GlassCard } from '../components/ui/v2';
import type { TabPillItem } from '../components/ui/v2';

type ViewMode = 'realtime' | 'cohort';
type DashboardDomainTab = 'overview' | 'sale' | 'product' | 'marketing' | 'media';

const TABS: TabPillItem<DashboardDomainTab>[] = [
  { value: 'overview', label: 'Overview', icon: <Activity /> },
  { value: 'sale', label: 'Sale', icon: <Users /> },
  { value: 'product', label: 'Product', icon: <Briefcase /> },
  { value: 'marketing', label: 'Marketing', icon: <TrendingUp /> },
  { value: 'media', label: 'Media', icon: <Monitor /> },
];

const VALID_TABS = new Set<DashboardDomainTab>(TABS.map((item) => item.value));

function parseDashboardTab(raw: string | null): DashboardDomainTab {
  if (raw && VALID_TABS.has(raw as DashboardDomainTab)) {
    return raw as DashboardDomainTab;
  }
  return 'overview';
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-headline text-[length:var(--text-h6)] font-semibold text-on-surface">
      {children}
    </h3>
  );
}

/**
 * DashboardOverview v2 — Phase 7 large pages migration (batch 1).
 *
 * Token-driven shell wrapping v1 sub-components:
 *  - PageHeader (italic accent + breadcrumb)
 *  - TabPill (5 domains: Overview / Sale / Product / Marketing / Media)
 *  - v1 DateRangePicker reused (deeper migration is sub-component task)
 *  - URL state preserved (`?tab=&legacy=`)
 *  - All sub-section content reused from v1 (AcquisitionOverviewTab, CallPerformanceSection,
 *    LeadDistributionSection, ProductSection, MarketingTab, MediaTab, etc.)
 *
 * Tab switching < 300ms — no extra fetch on tab change (data scoped to range).
 */
export default function DashboardOverviewV2() {
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
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabPill<DashboardDomainTab> label="Dashboard domain tabs" value={selectedTab} onChange={handleTabChange} items={TABS} />
        <V1DateRangePicker value={range} onChange={setRange} />
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pb-8">
        {selectedTab === 'overview' && (
          <>
            {searchParams.get('legacy') === 'true' ? (
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
            ) : (
              <>
                <AcquisitionOverviewTab from={range.from} to={range.to} />
                <KpiTable
                  data={data?.kpiMetrics}
                  isLoading={isLoading}
                  error={error as Error | null}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </>
            )}
          </>
        )}

        {selectedTab === 'sale' && (
          <>
            <CallPerformanceSection from={range.from} to={range.to} />
            <GlassCard variant="surface" padding="md" className="space-y-3">
              <SectionTitle>Lead Flow & Clearance</SectionTitle>
              <DashboardTab dateFrom={range.from} dateTo={range.to} />
            </GlassCard>
            <GlassCard variant="surface" padding="md" className="space-y-3">
              <SectionTitle>Lead Distribution</SectionTitle>
              <LeadDistributionSection from={range.from} to={range.to} />
            </GlassCard>
          </>
        )}

        {selectedTab === 'product' && <ProductSection from={range.from} to={range.to} />}
        {selectedTab === 'marketing' && <MarketingTab from={range.from} to={range.to} />}
        {selectedTab === 'media' && <MediaTab from={range.from} to={range.to} />}
      </div>
    </div>
  );
}
