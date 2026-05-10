import { Megaphone } from 'lucide-react';
import type { AdsCampaignSummary } from '../../types';
import { DataTable, EmptyState, Badge } from '../ui/v2';
import type { DataTableColumn } from '../ui/v2';

/**
 * Meta ad campaigns table — spend / impressions / clicks / conversions / CTR.
 *
 * Phase 8 follow-up batch 4 (2026-05-10): migrated to v2 DataTable primitive
 * (built-in sort), v2 Badge cho status, v2 EmptyState. API identical
 * (`<CampaignsTable campaigns={...} onSelect={...} />`).
 *
 * Default sort: spendTotal desc.
 */

interface Props {
  campaigns: AdsCampaignSummary[];
  onSelect?: (campaign: AdsCampaignSummary) => void;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  ARCHIVED: 'neutral',
  DELETED: 'error',
};

function fmtNumber(n: number) {
  return n.toLocaleString('en-US');
}

function fmtMoney(n: number, currency: string) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' ' + currency;
}

export default function CampaignsTable({ campaigns, onSelect }: Props) {
  const columns: DataTableColumn<AdsCampaignSummary>[] = [
    {
      key: 'name',
      label: 'Campaign',
      sortable: true,
      sort: (a, b) => a.name.localeCompare(b.name),
      render: (c) => <span className="font-medium text-on-surface">{c.name}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (c) => (
        <Badge variant={STATUS_VARIANT[c.status] ?? 'neutral'}>{c.status}</Badge>
      ),
    },
    {
      key: 'utm',
      label: 'UTM',
      hideBelow: 'md',
      render: (c) =>
        c.utmCampaign ? (
          <span className="font-mono text-[length:var(--text-caption)] text-on-surface-variant">{c.utmCampaign}</span>
        ) : (
          <span className="text-on-surface-variant/60">—</span>
        ),
    },
    {
      key: 'spendTotal',
      label: 'Spend',
      align: 'right',
      sortable: true,
      sort: (a, b) => a.spendTotal - b.spendTotal,
      render: (c) => <span className="font-headline font-bold">{fmtMoney(c.spendTotal, c.currency)}</span>,
    },
    {
      key: 'impressions',
      label: 'Impr.',
      align: 'right',
      hideBelow: 'lg',
      sortable: true,
      sort: (a, b) => a.impressions - b.impressions,
      render: (c) => <span className="font-semibold">{fmtNumber(c.impressions)}</span>,
    },
    {
      key: 'clicks',
      label: 'Clicks',
      align: 'right',
      sortable: true,
      sort: (a, b) => a.clicks - b.clicks,
      render: (c) => <span className="font-semibold">{fmtNumber(c.clicks)}</span>,
    },
    {
      key: 'conversions',
      label: 'Conv.',
      align: 'right',
      sortable: true,
      sort: (a, b) => a.conversions - b.conversions,
      render: (c) => <span className="font-semibold">{fmtNumber(c.conversions)}</span>,
    },
    {
      key: 'ctr',
      label: 'CTR',
      align: 'right',
      hideBelow: 'lg',
      sortable: true,
      sort: (a, b) => a.ctr - b.ctr,
      render: (c) => <span className="font-semibold">{(c.ctr * 100).toFixed(2)}%</span>,
    },
  ];

  return (
    <DataTable<AdsCampaignSummary>
      label="Ad campaigns"
      data={campaigns}
      columns={columns}
      rowKey={(c) => c.id}
      density="comfortable"
      sort={{ key: 'spendTotal', direction: 'desc' }}
      onSortChange={() => {}}
      onRowClick={onSelect}
      empty={
        <EmptyState
          icon={<Megaphone />}
          title="No campaigns yet"
          description="Run sync from admin to import Meta ad campaigns."
          variant="inline"
        />
      }
    />
  );
}
