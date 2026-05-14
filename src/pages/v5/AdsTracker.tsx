import { useMemo } from 'react';
import { format, startOfMonth } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { LayoutList, RefreshCw, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CampaignsTable from '../../components/ads-tracker/campaigns-table';
import AttributionTable from '../../components/ads-tracker/attribution-table';
import { AdsKpiCards } from '../../components/v5/growth/ads/ads-kpi-cards';
import { AdsSpendChart } from '../../components/v5/growth/ads/ads-spend-chart';
import { fromDateRange, toDateRange } from '../../components/v5/growth/date-range-utils';
import { Button, Card, DateRangePicker, TabPill } from '../../components/v5/ui';
import type { DateRange, TabPillItem } from '../../components/v5/ui';
import {
  useAdsAttributionQuery,
  useAdsAttributionUnmatchedQuery,
  useAdsCampaignsQuery,
  useTriggerAdsSyncMutation,
} from '../../hooks/use-ads-tracker';

type Tab = 'campaigns' | 'performance' | 'attribution';

const validTabs = new Set<Tab>(['campaigns', 'performance', 'attribution']);

function parseTab(raw: string | null): Tab {
  return raw && validTabs.has(raw as Tab) ? (raw as Tab) : 'campaigns';
}

const tabs: TabPillItem<Tab>[] = [
  { value: 'campaigns', label: 'Campaigns', icon: <LayoutList /> },
  { value: 'performance', label: 'Performance', icon: <TrendingUp /> },
  { value: 'attribution', label: 'Attribution', icon: <Target /> },
];

export default function AdsTrackerV5() {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const totals = useMemo(() => {
    const spend = campaigns.reduce((sum, campaign) => sum + Number(campaign.spendTotal ?? 0), 0);
    const active = campaigns.filter((campaign) => campaign.status === 'ACTIVE').length;
    const totalLeads = attribution.reduce((sum, row) => sum + Number(row.leadCount ?? 0), 0);
    const avgCpl = totalLeads > 0 ? spend / totalLeads : null;
    const currency = campaigns[0]?.currency ?? 'VND';
    return { spend, active, totalLeads, avgCpl, currency };
  }, [campaigns, attribution]);

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
      alert('Sync triggered. Refresh in a few minutes to see new data.');
    } catch (err: any) {
      alert(err?.message ?? 'Sync failed');
    }
  };

  return (
    <div className="flex h-full flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <DateRangePicker value={pickerValue} onChange={setRange} size="sm" label="Ads date range" />
        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            iconLeft={<RefreshCw className={syncMutation.isPending ? 'animate-spin' : ''} />}
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? 'Syncing...' : 'Sync Meta'}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto pb-1">
        <TabPill<Tab> label="Ads tracker tabs" value={activeTab} onChange={setActiveTab} items={tabs} size="page" className="min-w-max" />
      </div>

      <AdsKpiCards
        spend={totals.spend}
        active={totals.active}
        totalCampaigns={campaigns.length}
        totalLeads={totals.totalLeads}
        avgCpl={totals.avgCpl}
        currency={totals.currency}
      />

      <section className="flex flex-1 min-h-0 flex-col gap-4" aria-label="Ads tracker content">
        {activeTab === 'campaigns' && (
          <Card padding="none" glow className="flex-1 min-h-0 overflow-y-auto">
            <CampaignsTable campaigns={campaigns} />
          </Card>
        )}
        {activeTab === 'performance' && <AdsSpendChart campaigns={campaigns} />}
        {activeTab === 'attribution' && (
          <Card padding="none" glow className="flex-1 min-h-0 overflow-y-auto">
            <AttributionTable rows={attribution} unmatched={unmatched} />
          </Card>
        )}
      </section>
    </div>
  );
}
