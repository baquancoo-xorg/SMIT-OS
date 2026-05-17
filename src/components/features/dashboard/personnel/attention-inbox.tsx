/**
 * Attention Inbox — sortable + filterable feed of personnel needing action.
 * Reuses existing PersonnelProfileDrawer for drilldown.
 */

import { useMemo, useState } from 'react';
import { Check, Inbox } from 'lucide-react';
import { Card } from '../../../ui';
import { AttentionRow } from './attention-row';
import { PersonnelProfileDrawer } from '../../personnel/personnel-profile-drawer';
import type { AttentionItem } from '../../../../hooks/use-personnel-dashboard';

type SortKey = 'severity' | 'flags' | 'recent';
type FilterKey = 'all' | 'needs_attention' | 'at_risk';

const SORTS: Array<{ id: SortKey; label: string }> = [
  { id: 'severity', label: 'Mức độ' },
  { id: 'flags', label: 'Số flag' },
  { id: 'recent', label: 'Đánh giá gần nhất' },
];

const FILTERS: Array<{ id: FilterKey; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'at_risk', label: 'At Risk' },
  { id: 'needs_attention', label: 'Needs Attention' },
];

const INITIAL_LIMIT = 10;

function severityRank(s: AttentionItem['status']): number {
  return s === 'at_risk' ? 0 : s === 'needs_attention' ? 1 : 2;
}

interface Props {
  items: AttentionItem[];
}

export function AttentionInbox({ items }: Props) {
  const [sort, setSort] = useState<SortKey>('severity');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [expanded, setExpanded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const processed = useMemo(() => {
    let out = items;
    if (filter !== 'all') out = out.filter((i) => i.status === filter);
    const arr = [...out];
    arr.sort((a, b) => {
      if (sort === 'severity') {
        const r = severityRank(a.status) - severityRank(b.status);
        if (r !== 0) return r;
        return b.flags.length - a.flags.length;
      }
      if (sort === 'flags') return b.flags.length - a.flags.length;
      // recent: lastAssessedQuarter desc, null last
      const av = a.lastAssessedQuarter ?? '';
      const bv = b.lastAssessedQuarter ?? '';
      return bv.localeCompare(av);
    });
    return arr;
  }, [items, sort, filter]);

  const visible = expanded ? processed : processed.slice(0, INITIAL_LIMIT);
  const total = processed.length;

  return (
    <Card padding="md">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-card bg-surface-2 p-2 text-accent-text">
            <Inbox className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Attention Inbox</p>
            <h3 className="font-headline text-base font-black text-text-1">{total} nhân sự cần lưu ý</h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-input bg-surface-2 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-input px-2.5 py-1 text-[11px] font-bold transition ${
                  filter === f.id ? 'bg-surface text-text-1 shadow-card' : 'text-text-muted hover:text-text-1'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-input border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-text-1"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {total === 0 ? (
        <div className="grid place-items-center rounded-input border border-dashed border-border bg-surface-2/40 py-10 text-center">
          <Check className="mb-2 size-6 text-success" aria-hidden="true" />
          <p className="text-sm font-bold text-text-1">Toàn team on-track</p>
          <p className="mt-1 text-xs text-text-muted">Không có flag nào cần xử lý.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-1.5">
            {visible.map((item) => (
              <li key={item.personnelId}>
                <AttentionRow item={item} onOpen={setOpenId} />
              </li>
            ))}
          </ul>
          {total > INITIAL_LIMIT && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 w-full rounded-input border border-border bg-surface-2/40 py-2 text-xs font-bold text-text-2 transition hover:bg-surface-2 hover:text-text-1"
            >
              {expanded ? `Thu gọn` : `Hiện tất cả (${total})`}
            </button>
          )}
        </>
      )}

      {openId && <PersonnelProfileDrawer personnelId={openId} onClose={() => setOpenId(null)} />}
    </Card>
  );
}
