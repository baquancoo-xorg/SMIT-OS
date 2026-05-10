import { AlertTriangle } from 'lucide-react';
import type { AdsAttribution } from '../../types';
import { DataTable, EmptyState, GlassCard, Badge } from '../ui/v2';
import type { DataTableColumn } from '../ui/v2';

/**
 * Ads attribution table — campaigns × leads × CPL.
 *
 * Phase 8 follow-up batch 2 (2026-05-10): migrated to v2 DataTable primitive
 * + GlassCard wrapper + Badge for unmatched sources. API identical
 * (`<AttributionTable rows={...} unmatched={...} />`).
 *
 * Sortable columns: spend (default desc), leads, qualified, CPL.
 */

interface Props {
  rows: AdsAttribution[];
  unmatched?: { source: string; count: number }[];
}

function fmtMoney(n: number, currency: string) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' ' + currency;
}

export default function AttributionTable({ rows, unmatched }: Props) {
  const columns: DataTableColumn<AdsAttribution>[] = [
    {
      key: 'campaignName',
      label: 'Campaign',
      sortable: true,
      sort: (a, b) => a.campaignName.localeCompare(b.campaignName),
      render: (r) => <span className="font-medium text-on-surface">{r.campaignName}</span>,
    },
    {
      key: 'utm',
      label: 'UTM',
      hideBelow: 'md',
      render: (r) =>
        r.utmCampaign ? (
          <span className="font-mono text-[length:var(--text-caption)] text-on-surface-variant">{r.utmCampaign}</span>
        ) : (
          <span className="font-mono text-[length:var(--text-caption)] text-on-surface-variant/60 italic">missing</span>
        ),
    },
    {
      key: 'spendTotal',
      label: 'Spend',
      align: 'right',
      sortable: true,
      sort: (a, b) => a.spendTotal - b.spendTotal,
      render: (r) => <span className="font-headline font-bold">{fmtMoney(r.spendTotal, r.currency)}</span>,
    },
    {
      key: 'leadCount',
      label: 'Leads',
      align: 'right',
      sortable: true,
      sort: (a, b) => a.leadCount - b.leadCount,
      render: (r) => <span className="font-semibold">{r.leadCount}</span>,
    },
    {
      key: 'qualifiedCount',
      label: 'Qualified',
      align: 'right',
      sortable: true,
      sort: (a, b) => a.qualifiedCount - b.qualifiedCount,
      render: (r) => <span className="font-semibold text-tertiary">{r.qualifiedCount}</span>,
    },
    {
      key: 'cpl',
      label: 'CPL',
      align: 'right',
      sortable: true,
      sort: (a, b) => (a.cpl ?? Infinity) - (b.cpl ?? Infinity),
      render: (r) =>
        r.cpl != null ? (
          <span className="font-semibold">{fmtMoney(r.cpl, r.currency)}</span>
        ) : (
          <span className="text-on-surface-variant/60">—</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DataTable<AdsAttribution>
        label="Campaign attribution"
        data={rows}
        columns={columns}
        rowKey={(r) => r.campaignId}
        density="comfortable"
        sort={{ key: 'spendTotal', direction: 'desc' }}
        onSortChange={() => {}}
        empty={
          <EmptyState
            icon={<AlertTriangle />}
            title="No attribution data"
            description="Sync Meta + ensure Lead.source matches utm_campaign"
            variant="inline"
          />
        }
      />

      {unmatched && unmatched.length > 0 && (
        <GlassCard variant="surface" padding="md" className="border-warning/30 bg-warning-container/30">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4 text-warning" aria-hidden="true" />
            <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-warning-container">
              Lead sources without matching campaign ({unmatched.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {unmatched.slice(0, 20).map((u) => (
              <Badge key={u.source} variant="warning" size="md">
                <span className="font-mono">{u.source}</span>
                <span className="opacity-60 ml-1">×{u.count}</span>
              </Badge>
            ))}
          </div>
          {unmatched.length > 20 && (
            <p className="mt-2 text-[length:var(--text-caption)] font-medium text-on-warning-container/80">
              + {unmatched.length - 20} more — see UTM guideline doc
            </p>
          )}
        </GlassCard>
      )}
    </div>
  );
}
