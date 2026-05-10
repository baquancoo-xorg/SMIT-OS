import { useMemo, useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { LayoutList, TrendingUp, Target, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DatePicker from '../components/ui/DatePicker';
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

type Tab = 'campaigns' | 'performance' | 'attribution';

function fmtMoney(n: number, currency = 'VND') {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' ' + currency;
}

export default function AdsTracker() {
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

  const tabToggle = (
    <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
      <TabBtn active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} icon={<LayoutList size={10} />}>
        Campaigns
      </TabBtn>
      <TabBtn active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} icon={<TrendingUp size={10} />}>
        Performance
      </TabBtn>
      <TabBtn active={activeTab === 'attribution'} onClick={() => setActiveTab('attribution')} icon={<Target size={10} />}>
        Attribution
      </TabBtn>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer transition-colors">Acquisition</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Ads Tracker</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Ads <span className="text-primary italic">Tracker</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="From" />
            <span className="text-slate-300 text-xs">—</span>
            <DatePicker value={dateTo} onChange={setDateTo} placeholder="To" />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-surface-container-high text-slate-600 hover:bg-slate-200 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <Download size={13} />
            Export CSV
          </button>
          {isAdmin && (
            <button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw size={13} className={syncMutation.isPending ? 'animate-spin' : ''} />
              {syncMutation.isPending ? 'Syncing…' : 'Sync Meta'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
        <KpiCard
          label="Total Spend"
          value={fmtMoney(totals.spend, totals.currency)}
          highlight
        />
        <KpiCard label="Active Campaigns" value={String(totals.active)} subtitle={`${campaigns.length} total`} />
        <KpiCard label="Leads Attributed" value={totals.totalLeads.toLocaleString()} />
        <KpiCard
          label="Avg CPL"
          value={totals.avgCpl != null ? fmtMoney(totals.avgCpl, totals.currency) : '—'}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="shrink-0 flex items-center">{tabToggle}</div>

        {activeTab === 'campaigns' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CampaignsTable campaigns={campaigns} />
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <SpendChart campaigns={campaigns} />
          </div>
        )}

        {activeTab === 'attribution' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <AttributionTable rows={attribution} unmatched={unmatched} />
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtitle,
  highlight,
}: {
  label: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div className="bg-primary text-white p-4 xl:p-6 rounded-3xl shadow-xl shadow-primary/20 flex flex-col gap-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 xl:w-32 xl:h-32 bg-white/10 rounded-full -mr-10 -mt-10 xl:-mr-16 xl:-mt-16 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 relative z-10">{label}</p>
        <h4 className="text-2xl xl:text-4xl font-black font-headline relative z-10">{value}</h4>
        {subtitle && <p className="text-[10px] opacity-80 relative z-10">{subtitle}</p>}
      </div>
    );
  }
  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 p-4 xl:p-6 rounded-3xl shadow-sm flex flex-col gap-2 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 xl:w-32 xl:h-32 bg-primary/5 rounded-full -mr-10 -mt-10 xl:-mr-16 xl:-mt-16 group-hover:scale-150 transition-transform duration-700" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{label}</p>
      <h4 className="text-2xl xl:text-4xl font-black font-headline relative z-10">{value}</h4>
      {subtitle && (
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest relative z-10">{subtitle}</p>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 h-7 px-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
