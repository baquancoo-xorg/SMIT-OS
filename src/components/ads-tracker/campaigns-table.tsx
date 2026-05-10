import { useMemo, useState } from 'react';
import type { AdsCampaignSummary } from '../../types';

type SortKey = 'spendTotal' | 'impressions' | 'clicks' | 'conversions' | 'name';

interface Props {
  campaigns: AdsCampaignSummary[];
  onSelect?: (campaign: AdsCampaignSummary) => void;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  PAUSED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  ARCHIVED: 'bg-slate-200 text-slate-500 border-slate-300',
  DELETED: 'bg-error/10 text-error border-error/20',
};

function fmtNumber(n: number) {
  return n.toLocaleString('en-US');
}

function fmtMoney(n: number, currency: string) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' ' + currency;
}

export default function CampaignsTable({ campaigns, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('spendTotal');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const arr = [...campaigns];
    arr.sort((a, b) => {
      const av = sortKey === 'name' ? a.name : (a[sortKey] as number);
      const bv = sortKey === 'name' ? b.name : (b[sortKey] as number);
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [campaigns, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/40">
              <SortableTh active={sortKey === 'name'} dir={sortDir} onClick={() => toggleSort('name')}>
                Campaign
              </SortableTh>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">UTM</th>
              <SortableTh
                active={sortKey === 'spendTotal'}
                dir={sortDir}
                onClick={() => toggleSort('spendTotal')}
                align="right"
              >
                Spend
              </SortableTh>
              <SortableTh
                active={sortKey === 'impressions'}
                dir={sortDir}
                onClick={() => toggleSort('impressions')}
                align="right"
              >
                Impr.
              </SortableTh>
              <SortableTh
                active={sortKey === 'clicks'}
                dir={sortDir}
                onClick={() => toggleSort('clicks')}
                align="right"
              >
                Clicks
              </SortableTh>
              <SortableTh
                active={sortKey === 'conversions'}
                dir={sortDir}
                onClick={() => toggleSort('conversions')}
                align="right"
              >
                Conv.
              </SortableTh>
              <th className="px-4 py-3 text-right">CTR</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                  No campaigns yet — run sync from admin
                </td>
              </tr>
            ) : (
              sorted.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelect?.(c)}
                  className="border-b border-white/30 hover:bg-white/40 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-on-surface">{c.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                        STATUS_COLORS[c.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">
                    {c.utmCampaign ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-headline font-black">
                    {fmtMoney(c.spendTotal, c.currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold">{fmtNumber(c.impressions)}</td>
                  <td className="px-4 py-3 text-right text-xs font-bold">{fmtNumber(c.clicks)}</td>
                  <td className="px-4 py-3 text-right text-xs font-bold">{fmtNumber(c.conversions)}</td>
                  <td className="px-4 py-3 text-right text-xs font-bold">
                    {(c.ctr * 100).toFixed(2)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableTh({
  active,
  dir,
  onClick,
  align,
  children,
}: {
  active: boolean;
  dir: 'asc' | 'desc';
  onClick: () => void;
  align?: 'right';
  children: React.ReactNode;
}) {
  return (
    <th
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer select-none ${align === 'right' ? 'text-right' : ''} ${
        active ? 'text-primary' : ''
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {active && (
          <span className="material-symbols-outlined text-[12px]">
            {dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
          </span>
        )}
      </span>
    </th>
  );
}
