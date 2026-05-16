import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import type { AdsCampaignSummary } from '../../../types';
import {
  EmptyState,
  Badge,
  TableShell,
  SortableTh,
  useSortableData,
  type SortableValue,
} from '../../ui';
import { getTableContract } from '../../ui/table-contract';

/**
 * Meta ad campaigns table — spend / impressions / clicks / conversions / CTR.
 *
 * Round 2 (2026-05-11): migrated DataTable → TableShell for visual parity với Lead Logs.
 * Uses useSortableData hook. Default sort: spendTotal desc.
 */

interface Props {
  campaigns: AdsCampaignSummary[];
  onSelect?: (campaign: AdsCampaignSummary) => void;
}

type SortKey = 'name' | 'spendTotal' | 'impressions' | 'clicks' | 'conversions' | 'ctr';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  ARCHIVED: 'neutral',
  DELETED: 'error',
};

const PAGE_SIZE = 20;

function fmtNumber(n: number) {
  return Number(n).toLocaleString('en-US');
}

function fmtMoney(n: number, currency: string) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n)) + ' ' + currency;
}

const accessor = (row: AdsCampaignSummary, key: SortKey): SortableValue => {
  switch (key) {
    case 'name':
      return row.name;
    case 'spendTotal':
      return Number(row.spendTotal);
    case 'impressions':
      return Number(row.impressions);
    case 'clicks':
      return Number(row.clicks);
    case 'conversions':
      return Number(row.conversions);
    case 'ctr':
      return Number(row.ctr);
    default:
      return null;
  }
};

export default function CampaignsTable({ campaigns, onSelect }: Props) {
  const contract = getTableContract('standard');
  const [page, setPage] = useState(0);
  const { sorted, sortKey, sortDir, toggleSort } = useSortableData<AdsCampaignSummary, SortKey>(
    campaigns,
    'spendTotal',
    'desc',
    accessor,
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageCampaigns = useMemo(() => {
    const start = page * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [page, sorted]);

  useEffect(() => {
    setPage(0);
  }, [campaigns]);

  useEffect(() => {
    if (page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TableShell
          variant="standard"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          scrollClassName="flex-1 min-h-0 overflow-y-auto overflow-x-auto"
          tableClassName="min-w-[840px]"
        >
          <thead className="sticky top-0 z-20 bg-surface">
            <tr className={contract.headerRow}>
              <SortableTh<SortKey>
                sortKey="name"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={contract.headerCell}
              >
                Campaign
              </SortableTh>
              <th className={contract.headerCell}>Status</th>
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
                sortKey="impressions"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} text-right`}
                align="right"
              >
                Impr.
              </SortableTh>
              <SortableTh<SortKey>
                sortKey="clicks"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} text-right`}
                align="right"
              >
                Clicks
              </SortableTh>
              <SortableTh<SortKey>
                sortKey="conversions"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} text-right`}
                align="right"
              >
                Conv.
              </SortableTh>
              <SortableTh<SortKey>
                sortKey="ctr"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} text-right`}
                align="right"
              >
                CTR
              </SortableTh>
            </tr>
          </thead>
          <tbody className={contract.body}>
            {pageCampaigns.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-0">
                  <EmptyState
                    icon={<Megaphone />}
                    title="No campaigns yet"
                    description="Run sync from admin to import Meta ad campaigns."
                    variant="inline"
                  />
                </td>
              </tr>
            ) : (
              pageCampaigns.map((c) => (
                <tr
                  key={c.id}
                  className={`${contract.row} ${onSelect ? 'cursor-pointer' : ''}`}
                  onClick={onSelect ? () => onSelect(c) : undefined}
                >
                  <td className={contract.cell}>
                    <span className="font-medium text-on-surface">{c.name}</span>
                  </td>
                  <td className={contract.cell}>
                    <Badge variant={STATUS_VARIANT[c.status] ?? 'neutral'}>{c.status}</Badge>
                  </td>
                  <td className={contract.cell}>
                    {c.utmCampaign ? (
                      <span className="font-mono text-[length:var(--text-caption)] text-on-surface-variant">
                        {c.utmCampaign}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant/60">—</span>
                    )}
                  </td>
                  <td className={`${contract.cell} text-right`}>
                    <span className="font-headline font-bold">{fmtMoney(c.spendTotal, c.currency)}</span>
                  </td>
                  <td className={`${contract.cell} text-right`}>
                    <span className="font-semibold">{fmtNumber(c.impressions)}</span>
                  </td>
                  <td className={`${contract.cell} text-right`}>
                    <span className="font-semibold">{fmtNumber(c.clicks)}</span>
                  </td>
                  <td className={`${contract.cell} text-right`}>
                    <span className="font-semibold">{fmtNumber(c.conversions)}</span>
                  </td>
                  <td className={`${contract.cell} text-right`}>
                    <span className="font-semibold">{(Number(c.ctr) * 100).toFixed(2)}%</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </div>

      <div className="mt-auto flex shrink-0 items-center justify-between gap-3 border-t border-outline-variant/40 px-1 pt-3 text-[length:var(--text-body-sm)] text-on-surface-variant">
        <span>
          Page {page + 1} of {totalPages} · {sorted.length} rows
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0}
            aria-label="Previous page"
            className="inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            disabled={page >= totalPages - 1}
            aria-label="Next page"
            className="inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
