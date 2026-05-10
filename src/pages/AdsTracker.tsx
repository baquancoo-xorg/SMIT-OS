import { useMemo, useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import {
  LayoutList,
  TrendingUp,
  Target,
  RefreshCw,
  Download,
  DollarSign,
  Activity,
  Users,
  Calculator,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CampaignsTable from '../components/ads-tracker/campaigns-table';
import SpendChart from '../components/ads-tracker/spend-chart';
import AttributionTable from '../components/ads-tracker/attribution-table';
import {
  useAdsCampaignsQuery,
  useAdsAttributionQuery,
  useAdsAttributionUnmatchedQuery,
  useTriggerAdsSyncMutation,
} from '../hooks/use-ads-tracker';
import { exportAdsCampaignsToCsv, exportAdsAttributionToCsv } from '../components/ads-tracker/csv-export';
import {
  PageHeader,
  Button,
  TabPill,
  KpiCard,
  GlassCard,
} from '../components/ui/v2';
import type { TabPillItem } from '../components/ui/v2';

type Tab = 'campaigns' | 'performance' | 'attribution';

const TABS: TabPillItem<Tab>[] = [
  { value: 'campaigns', label: 'Campaigns', icon: <LayoutList /> },
  { value: 'performance', label: 'Performance', icon: <TrendingUp /> },
  { value: 'attribution', label: 'Attribution', icon: <Target /> },
];

function fmtMoney(n: number, currency = 'VND') {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' ' + currency;
}

/**
 * AdsTracker v2 — Phase 6 medium pages migration.
 *
 * Token-driven shell wrapping v1 sub-components (CampaignsTable, SpendChart, AttributionTable):
 *  - PageHeader (italic accent + breadcrumb)
 *  - KpiCard (Bento) for spend/leads/CPL metrics
 *  - TabPill (Campaigns / Performance / Attribution)
 *  - v2 Button for date range, export, sync (admin only)
 *
 * RBAC: Sync Meta = admin only (matches backend).
 */
export default function AdsTrackerV2() {
  const { currentUser } = useAuth();
  const isAdmin = !!currentUser?.isAdmin;
  const [activeTab, setActiveTab] = useState<Tab>('campaigns');
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const params = useMemo(() => ({ from: dateFrom, to: dateTo }), [dateFrom, dateTo]);

  const campaignsQuery = useAdsCampaignsQuery(params);
  const attributionQuery = useAdsAttributionQuery(params);
  const unmatchedQuery = useAdsAttributionUnmatchedQuery(params);
  const syncMutation = useTriggerAdsSyncMutation();

  const campaigns = campaignsQuery.data ?? [];
  const attribution = attributionQuery.data ?? [];
  const unmatched = unmatchedQuery.data ?? [];

  const totals = useMemo(() => {
    const spend = campaigns.reduce((s, c) => s + c.spendTotal, 0);
    const active = campaigns.filter((c) => c.status === 'ACTIVE').length;
    const totalLeads = attribution.reduce((s, a) => s + a.leadCount, 0);
    const avgCpl = totalLeads > 0 ? spend / totalLeads : null;
    const currency = campaigns[0]?.currency ?? 'VND';
    return { spend, active, totalLeads, avgCpl, currency };
  }, [campaigns, attribution]);

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync(undefined);
      alert('Sync triggered. Refresh in a few minutes to see new data.');
    } catch (err: any) {
      alert(err?.message ?? 'Sync failed');
    }
  };

  const handleExport = async () => {
    try {
      if (activeTab === 'attribution') {
        await exportAdsAttributionToCsv(params);
      } else {
        await exportAdsCampaignsToCsv(params);
      }
    } catch (err: any) {
      alert(err?.message ?? 'Export failed');
    }
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        className="h-9 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body-sm)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
      />
      <span className="text-on-surface-variant">—</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        className="h-9 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body-sm)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
      />
      <Button variant="ghost" iconLeft={<Download />} onClick={handleExport}>
        Export CSV
      </Button>
      {isAdmin && (
        <Button
          variant="primary"
          iconLeft={<RefreshCw className={syncMutation.isPending ? 'animate-spin' : ''} />}
          onClick={handleSync}
          disabled={syncMutation.isPending}
        >
          {syncMutation.isPending ? 'Syncing...' : 'Sync Meta'}
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Acquisition' }, { label: 'Ads Tracker' }]}
        title="Ads "
        accent="Tracker"
        description="Meta ad campaigns: spend, performance, lead attribution."
        actions={headerActions}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard
          label="Total Spend"
          value={fmtMoney(totals.spend, totals.currency)}
          icon={<DollarSign />}
          accent="primary"
        />
        <KpiCard
          label="Active Campaigns"
          value={String(totals.active)}
          unit={`/ ${campaigns.length}`}
          icon={<Activity />}
          accent="info"
        />
        <KpiCard label="Leads Attributed" value={totals.totalLeads.toLocaleString()} icon={<Users />} accent="success" />
        <KpiCard
          label="Avg CPL"
          value={totals.avgCpl != null ? fmtMoney(totals.avgCpl, totals.currency) : '—'}
          icon={<Calculator />}
          accent="warning"
        />
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-4">
        <TabPill<Tab> label="Ads tracker tabs" value={activeTab} onChange={setActiveTab} items={TABS} />

        {activeTab === 'campaigns' && (
          <GlassCard variant="surface" padding="none" className="flex-1 min-h-0 overflow-y-auto">
            <CampaignsTable campaigns={campaigns} />
          </GlassCard>
        )}

        {activeTab === 'performance' && (
          <GlassCard variant="surface" padding="md" className="flex-1 min-h-0 overflow-y-auto">
            <SpendChart campaigns={campaigns} />
          </GlassCard>
        )}

        {activeTab === 'attribution' && (
          <GlassCard variant="surface" padding="none" className="flex-1 min-h-0 overflow-y-auto">
            <AttributionTable rows={attribution} unmatched={unmatched} />
          </GlassCard>
        )}
      </div>
    </div>
  );
}
