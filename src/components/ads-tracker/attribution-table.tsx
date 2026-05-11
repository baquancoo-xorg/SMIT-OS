import { AlertTriangle } from 'lucide-react';
import type { AdsAttribution } from '../../types';
import {
  EmptyState,
  GlassCard,
  Badge,
  TableShell,
  SortableTh,
  useSortableData,
  type SortableValue,
} from '../ui';
import { getTableContract } from '../ui/table-contract';

/**
 * Ads attribution table — campaigns × leads × CPL.
 *
 * Round 2 (2026-05-11): migrated DataTable → TableShell for visual parity với Lead Logs.
 * Sortable columns: campaign, spend (default desc), leads, qualified, CPL.
 */

interface Props {
  rows: AdsAttribution[];
  unmatched?: { source: string; count: number }[];
}

type SortKey = 'campaignName' | 'spendTotal' | 'leadCount' | 'qualifiedCount' | 'cpl';

function fmtMoney(n: number, currency: string) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n)) + ' ' + currency;
}

const accessor = (row: AdsAttribution, key: SortKey): SortableValue => {
  switch (key) {
    case 'campaignName':
      return row.campaignName;
    case 'spendTotal':
      return Number(row.spendTotal);
    case 'leadCount':
      return Number(row.leadCount);
    case 'qualifiedCount':
      return Number(row.qualifiedCount);
    case 'cpl':
      return row.cpl != null ? Number(row.cpl) : null;
    default:
      return null;
  }
};

export default function AttributionTable({ rows, unmatched }: Props) {
  const contract = getTableContract('standard');
  const { sorted, sortKey, sortDir, toggleSort } = useSortableData<AdsAttribution, SortKey>(
    rows,
    'spendTotal',
    'desc',
    accessor,
  );

  return (
    <div className="flex flex-col gap-4">
      <TableShell variant="standard" tableClassName="min-w-[720px]">
        <thead className="sticky top-0 z-20 bg-surface">
          <tr className={contract.headerRow}>
            <SortableTh<SortKey>
              sortKey="campaignName"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              className={contract.headerCell}
            >
              Campaign
            </SortableTh>
            <th className={contract.headerCell}>UTM</th>
            <SortableTh<SortKey>
              sortKey="spendTotal"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              className={`${contract.headerCell} text-right`}
              align="right"
            >
              Spend
            </SortableTh>
            <SortableTh<SortKey>
              sortKey="leadCount"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              className={`${contract.headerCell} text-right`}
              align="right"
            >
              Leads
            </SortableTh>
            <SortableTh<SortKey>
              sortKey="qualifiedCount"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              className={`${contract.headerCell} text-right`}
              align="right"
            >
              Qualified
            </SortableTh>
            <SortableTh<SortKey>
              sortKey="cpl"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              className={`${contract.headerCell} text-right`}
              align="right"
            >
              CPL
            </SortableTh>
          </tr>
        </thead>
        <tbody className={contract.body}>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-0">
                <EmptyState
                  icon={<AlertTriangle />}
                  title="No attribution data"
                  description="Sync Meta + ensure Lead.source matches utm_campaign"
                  variant="inline"
                />
              </td>
            </tr>
          ) : (
            sorted.map((r) => (
              <tr key={r.campaignId} className={contract.row}>
                <td className={contract.cell}>
                  <span className="font-medium text-on-surface">{r.campaignName}</span>
                </td>
                <td className={contract.cell}>
                  {r.utmCampaign ? (
                    <span className="font-mono text-[length:var(--text-caption)] text-on-surface-variant">
                      {r.utmCampaign}
                    </span>
                  ) : (
                    <span className="font-mono text-[length:var(--text-caption)] text-on-surface-variant/60 italic">
                      missing
                    </span>
                  )}
                </td>
                <td className={`${contract.cell} text-right`}>
                  <span className="font-headline font-bold">{fmtMoney(r.spendTotal, r.currency)}</span>
                </td>
                <td className={`${contract.cell} text-right`}>
                  <span className="font-semibold">{r.leadCount}</span>
                </td>
                <td className={`${contract.cell} text-right`}>
                  <span className="font-semibold text-tertiary">{r.qualifiedCount}</span>
                </td>
                <td className={`${contract.cell} text-right`}>
                  {r.cpl != null ? (
                    <span className="font-semibold">{fmtMoney(r.cpl, r.currency)}</span>
                  ) : (
                    <span className="text-on-surface-variant/60">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </TableShell>

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
