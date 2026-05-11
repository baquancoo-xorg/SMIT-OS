import { Megaphone } from 'lucide-react';
import type { AdsCampaignSummary } from '../../types';
import {
  EmptyState,
  Badge,
  TableShell,
  SortableTh,
  useSortableData,
  type SortableValue,
} from '../ui';
import { getTableContract } from '../ui/table-contract';

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
  const { sorted, sortKey, sortDir, toggleSort } = useSortableData<AdsCampaignSummary, SortKey>(
    campaigns,
    'spendTotal',
    'desc',
    accessor,
  );

  return (
    <TableShell variant="standard" tableClassName="min-w-[840px]">
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
        {sorted.length === 0 ? (
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
          sorted.map((c) => (
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
  );
}
