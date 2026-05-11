import { useMemo, useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { Plus } from 'lucide-react';
import {
  Badge,
  Button,
  DataTable,
  DateRangePicker,
  EmptyState,
  KpiCard,
  PageHeader,
  Spinner,
  SurfaceCard,
  TableRowActions,
  type DataTableColumn,
  type DateRange,
  type TaskStatus,
} from '../design/v4/index.js';
import { useAdsCampaignsQuery } from '../hooks/use-ads-tracker';

interface CampaignRow {
  id: string;
  name: string;
  status: TaskStatus;
  spend?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
}

function statusToTaskStatus(s: string | undefined): TaskStatus {
  if (!s) return 'to-do';
  const norm = s.toLowerCase();
  if (norm.includes('active') || norm.includes('running')) return 'in-progress';
  if (norm.includes('pause') || norm.includes('hold')) return 'on-hold';
  if (norm.includes('arch')) return 'archived';
  if (norm.includes('end') || norm.includes('done') || norm.includes('complet')) return 'done';
  return 'to-do';
}

export default function AdsTrackerV4() {
  const defaultFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const defaultTo = format(new Date(), 'yyyy-MM-dd');
  const [range, setRange] = useState<DateRange>({ from: defaultFrom, to: defaultTo });

  const ads = useAdsCampaignsQuery(range);

  const rows: CampaignRow[] = useMemo(() => {
    const data = (ads.data ?? []) as any[];
    return data.map((c: any) => ({
      id: c.id ?? c.campaignId,
      name: c.name ?? c.campaign_name ?? 'Unnamed',
      status: statusToTaskStatus(c.status),
      spend: c.spend ?? c.total_spend,
      impressions: c.impressions,
      clicks: c.clicks,
      ctr: c.ctr,
    }));
  }, [ads.data]);

  const totalSpend = useMemo(() => rows.reduce((acc, r) => acc + (r.spend ?? 0), 0), [rows]);
  const totalImpr = useMemo(() => rows.reduce((acc, r) => acc + (r.impressions ?? 0), 0), [rows]);
  const totalClicks = useMemo(() => rows.reduce((acc, r) => acc + (r.clicks ?? 0), 0), [rows]);
  const avgCtr = totalImpr > 0 ? ((totalClicks / totalImpr) * 100).toFixed(2) : '—';

  const cols: DataTableColumn<CampaignRow>[] = [
    { key: 'name', header: 'Campaign', cell: (r) => r.name, sortable: true, sortValue: (r) => r.name },
    { key: 'status', header: 'Status', cell: (r) => <Badge intent={r.status}>{r.status}</Badge> },
    { key: 'spend', header: 'Spend', cell: (r) => r.spend != null ? `$${r.spend.toLocaleString()}` : '—', sortable: true, sortValue: (r) => r.spend ?? 0, align: 'right' },
    { key: 'impressions', header: 'Impressions', cell: (r) => r.impressions?.toLocaleString() ?? '—', sortable: true, sortValue: (r) => r.impressions ?? 0, align: 'right' },
    { key: 'clicks', header: 'Clicks', cell: (r) => r.clicks?.toLocaleString() ?? '—', sortable: true, sortValue: (r) => r.clicks ?? 0, align: 'right' },
    { key: 'ctr', header: 'CTR', cell: (r) => r.ctr != null ? `${r.ctr.toFixed(2)}%` : '—', align: 'right' },
    {
      key: 'actions',
      header: '',
      cell: () => (
        <TableRowActions
          items={[
            { key: 'view', label: 'View report', onSelect: () => {} },
            { key: 'pause', label: 'Pause', onSelect: () => {} },
            { key: 'archive', label: 'Archive', danger: true, onSelect: () => {} },
          ]}
        />
      ),
      align: 'right',
      width: 'w-16',
    },
  ];

  return (
    <div className="flex flex-col gap-comfy">
      <PageHeader
        title="Ads Tracker"
        subtitle={`${rows.length} campaigns in range`}
        actions={
          <>
            <DateRangePicker value={range} onChange={setRange} />
            <Button variant="primary" leftIcon={<Plus size={16} />}>New Campaign</Button>
          </>
        }
      />

      {ads.isLoading ? (
        <div className="flex items-center justify-center py-vast"><Spinner size="lg" accent /></div>
      ) : ads.error ? (
        <SurfaceCard padding="md"><Badge intent="error">Failed to load campaigns</Badge></SurfaceCard>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-comfy">
            <KpiCard label="Total Spend" value={`$${totalSpend.toLocaleString()}`} />
            <KpiCard label="Impressions" value={totalImpr.toLocaleString()} />
            <KpiCard label="Clicks" value={totalClicks.toLocaleString()} />
            <KpiCard label="Avg CTR" value={`${avgCtr}%`} />
          </div>

          {rows.length === 0 ? (
            <SurfaceCard padding="md">
              <EmptyState
                title="No campaigns yet"
                description="Create your first ad campaign to begin tracking performance."
                action={<Button variant="primary" leftIcon={<Plus size={16} />}>Create Campaign</Button>}
              />
            </SurfaceCard>
          ) : (
            <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} stickyHeader />
          )}
        </>
      )}
    </div>
  );
}
