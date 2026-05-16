import { useMemo, useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { Filter, LayoutGrid, LayoutList, RefreshCw, Search, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CampaignsTable from '../components/features/ads/campaigns-table';
import AttributionTable from '../components/features/ads/attribution-table';
import SpendChart from '../components/features/ads/spend-chart';
import { fromDateRange, toDateRange } from '../components/features/media/date-range-utils';
import { Button, Card, DateRangePicker, FilterChip, GlassCard, PageSectionStack, PageToolbar, StatBar, TabPill, useToast } from '../components/ui';
import type { DateRange, TabPillItem } from '../components/ui';
import {
  useAdsAttributionQuery,
  useAdsAttributionUnmatchedQuery,
  useAdsCampaignsQuery,
  useTriggerAdsSyncMutation,
} from '../hooks/use-ads-tracker';

type Tab = 'campaigns' | 'performance' | 'attribution';
type CampaignStatusFilter = 'ALL' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
type CampaignGroupFilter = 'none' | 'platform' | 'status';

const validTabs = new Set<Tab>(['campaigns', 'performance', 'attribution']);

function parseTab(raw: string | null): Tab {
  return raw && validTabs.has(raw as Tab) ? (raw as Tab) : 'campaigns';
}

const tabs: TabPillItem<Tab>[] = [
  { value: 'campaigns', label: 'Campaigns', icon: <LayoutList /> },
  { value: 'performance', label: 'Performance', icon: <TrendingUp /> },
  { value: 'attribution', label: 'Attribution', icon: <Target /> },
];

const campaignStatusOptions = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'ARCHIVED', label: 'Archived' },
  { value: 'DELETED', label: 'Deleted' },
] satisfies Array<{ value: CampaignStatusFilter; label: string }>;

const campaignGroupOptions = [
  { value: 'none', label: 'No grouping' },
  { value: 'platform', label: 'By platform' },
  { value: 'status', label: 'By status' },
] satisfies Array<{ value: CampaignGroupFilter; label: string }>;

export default function AdsTrackerV5() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatusFilter>('ALL');
  const [campaignGroup, setCampaignGroup] = useState<CampaignGroupFilter>('none');
  const defaultFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const defaultTo = format(new Date(), 'yyyy-MM-dd');
  const dateFrom = searchParams.get('date_from') ?? defaultFrom;
  const dateTo = searchParams.get('date_to') ?? defaultTo;
  const activeTab = parseTab(searchParams.get('tab'));
  const pickerValue = useMemo(() => toDateRange(dateFrom, dateTo), [dateFrom, dateTo]);
  const params = useMemo(() => ({ from: dateFrom, to: dateTo }), [dateFrom, dateTo]);

  const campaignsQuery = useAdsCampaignsQuery(params);
  const attributionQuery = useAdsAttributionQuery(params);
  const unmatchedQuery = useAdsAttributionUnmatchedQuery(params);
  const syncMutation = useTriggerAdsSyncMutation();

  const campaigns = campaignsQuery.data ?? [];
  const attribution = attributionQuery.data ?? [];
  const unmatched = unmatchedQuery.data ?? [];
  const isAdmin = !!currentUser?.isAdmin;

  const filteredCampaigns = useMemo(() => {
    const q = campaignSearch.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesSearch =
        q.length === 0 ||
        campaign.name.toLowerCase().includes(q) ||
        campaign.externalId.toLowerCase().includes(q) ||
        (campaign.utmCampaign?.toLowerCase().includes(q) ?? false);
      const matchesStatus = campaignStatus === 'ALL' || campaign.status === campaignStatus;
      return matchesSearch && matchesStatus;
    });
  }, [campaignSearch, campaignStatus, campaigns]);

  const statGroups = useMemo(() => {
    const countStatus = (s: string) => campaigns.filter((c) => c.status === s).length;
    const platformMap = new Map<string, number>();
    campaigns.forEach((c) => platformMap.set(c.platform, (platformMap.get(c.platform) ?? 0) + 1));

    const statusGroup = {
      items: [
        { label: 'Total', value: campaigns.length, dotClass: 'bg-on-surface-variant' },
        { label: 'Active', value: countStatus('ACTIVE'), dotClass: 'bg-success' },
        { label: 'Paused', value: countStatus('PAUSED'), dotClass: 'bg-warning' },
        { label: 'Ended', value: countStatus('ARCHIVED') + countStatus('DELETED'), dotClass: 'bg-error' },
      ],
    };
    const platformGroup = {
      items: Array.from(platformMap.entries()).map(([platform, count]) => ({
        label: platform,
        value: count,
        dotClass: platform === 'META' ? 'bg-info' : 'bg-accent',
      })),
    };
    return platformGroup.items.length > 0 ? [statusGroup, platformGroup] : [statusGroup];
  }, [campaigns]);

  const setRange = (next: DateRange) => {
    const formatted = fromDateRange(next);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('date_from', formatted.from);
    nextParams.set('date_to', formatted.to);
    setSearchParams(nextParams);
  };

  function setActiveTab(next: Tab) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', next);
    setSearchParams(nextParams, { replace: true });
  }

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync(undefined);
      toast({ tone: 'success', title: 'Meta sync triggered', description: 'Refresh in a few minutes to see new data.' });
    } catch (err: any) {
      toast({ tone: 'error', title: 'Meta sync failed', description: err?.message ?? 'Sync failed' });
    }
  };

  return (
    <PageSectionStack className="h-[calc(100dvh-var(--header-h)-var(--page-pt)-var(--page-pb))] min-h-0 gap-4 overflow-hidden pb-0">
      <PageToolbar className="flex-nowrap overflow-hidden" left={<div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-hidden"> <TabPill<Tab> label="Ads tracker tabs" value={activeTab} onChange={setActiveTab} items={tabs} size="page" className="shrink-0" /> <div className="relative flex h-[34px] items-center"> <Search className="pointer-events-none absolute left-3 size-3.5 text-on-surface-variant" aria-hidden="true" /> <input type="search" value={campaignSearch} onChange={(event) => setCampaignSearch(event.target.value)} placeholder="Search campaigns or UTM" aria-label="Search campaigns or UTM" className="h-[34px] w-[220px] rounded-input border border-outline-variant bg-surface-container-lowest pl-8 pr-3 text-[length:var(--text-body-sm)] font-medium text-on-surface placeholder:text-on-surface-variant/60 hover:border-accent/25 hover:shadow-glass focus-visible:border-accent/25 focus-visible:outline-none" /> </div> <FilterChip<CampaignStatusFilter> value={campaignStatus} onChange={(value) => setCampaignStatus(value as CampaignStatusFilter)} options={campaignStatusOptions} icon={<Filter size={14} />} placeholder="All statuses" label="Filter campaigns by status" size="sm" className="shrink-0" /> <FilterChip<CampaignGroupFilter> value={campaignGroup} onChange={(value) => setCampaignGroup(value as CampaignGroupFilter)} options={campaignGroupOptions} icon={<LayoutGrid size={14} />} placeholder="No grouping" label="Group campaigns" size="sm" className="shrink-0" /> </div>} right={<div className="flex shrink-0 items-center gap-2"> {isAdmin && (<Button variant="primary" size="sm" className="h-[34px] text-[length:var(--text-body-sm)]" iconLeft={<RefreshCw className={syncMutation.isPending ? 'animate-spin' : ''} />} onClick={handleSync} disabled={syncMutation.isPending}>{syncMutation.isPending ? 'Syncing Meta' : 'Sync Meta'}</Button>)} <DateRangePicker value={pickerValue} onChange={setRange} size="sm" label="Ads date range" buttonClassName="h-[34px]" /> </div>} />

      <div className="grid min-h-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)] gap-4 overflow-hidden">
        <GlassCard variant="surface" padding="sm" className="shrink-0">
          <StatBar groups={statGroups} />
        </GlassCard>

        {activeTab === 'campaigns' && (
          <Card padding="none" glow className="min-h-0 overflow-hidden">
            <CampaignsTable campaigns={filteredCampaigns} />
          </Card>
        )}
        {activeTab === 'performance' && <SpendChart campaigns={campaigns} />}
        {activeTab === 'attribution' && (
          <Card padding="none" glow className="min-h-0 overflow-hidden">
            <AttributionTable rows={attribution} unmatched={unmatched} />
          </Card>
        )}
      </div>
    </PageSectionStack>
  );
}
