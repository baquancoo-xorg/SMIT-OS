import { Edit3, ExternalLink, Trash2, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import type { MediaPost } from '../../types';
import PlatformBadge from './platform-badge';
import {
  EmptyState,
  Badge,
  Button,
  TableShell,
  SortableTh,
  useSortableData,
  type SortableValue,
} from '../ui';
import { getTableContract } from '../ui/table-contract';

/**
 * Media posts table — owned/KOL/PR posts với reach, engagement, optional cost + sentiment.
 *
 * Round 2 (2026-05-11): migrated DataTable → TableShell for visual parity với Lead Logs.
 * Uses useSortableData hook + SortableTh helper. Skipped pagination (rows < 50 today).
 */

interface Props {
  posts: MediaPost[];
  currentUserId?: string;
  isAdmin?: boolean;
  onEdit?: (post: MediaPost) => void;
  onDelete?: (post: MediaPost) => void;
  showCost?: boolean;
  showSentiment?: boolean;
}

type SortKey = 'type' | 'title' | 'publishedAt' | 'reach' | 'engagement' | 'cost';

const TYPE_BADGE: Record<string, string> = {
  ORGANIC: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  KOL: 'bg-[#E60076]/10 text-[#E60076] border-[#E60076]/20',
  KOC: 'bg-[#F54A00]/10 text-[#F54A00] border-[#F54A00]/20',
  PR: 'bg-[#0059B6]/10 text-[#0059B6] border-[#0059B6]/20',
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded-chip border px-2 text-[length:var(--text-caption)] font-medium tracking-[var(--tracking-wide)] whitespace-nowrap ${
        TYPE_BADGE[type] ?? 'bg-surface-container text-on-surface-variant border-outline-variant'
      }`}
    >
      {type}
    </span>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const variant = sentiment === 'positive' ? 'success' : sentiment === 'negative' ? 'error' : 'neutral';
  return <Badge variant={variant}>{sentiment}</Badge>;
}

function fmtNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('en-US');
}

const accessor = (row: MediaPost, key: SortKey): SortableValue => {
  switch (key) {
    case 'type':
      return row.type;
    case 'title':
      return row.title ?? '';
    case 'publishedAt':
      return new Date(row.publishedAt);
    case 'reach':
      return row.reach;
    case 'engagement':
      return row.engagement;
    case 'cost':
      return Number(row.cost ?? 0);
    default:
      return null;
  }
};

export default function MediaPostsTable({
  posts,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
  showCost,
  showSentiment,
}: Props) {
  const contract = getTableContract('standard');
  const { sorted, sortKey, sortDir, toggleSort } = useSortableData<MediaPost, SortKey>(
    posts,
    'publishedAt',
    'desc',
    accessor,
  );

  const colCount = 6 + (showCost ? 1 : 0) + (showSentiment ? 1 : 0) + 1; // +1 actions

  return (
    <TableShell variant="standard" tableClassName="min-w-[920px]">
      <thead className="sticky top-0 z-20 bg-surface">
        <tr className={contract.headerRow}>
          <th className={contract.headerCell}>Platform</th>
          <SortableTh<SortKey>
            sortKey="type"
            current={sortKey}
            dir={sortDir}
            onClick={toggleSort}
            className={contract.headerCell}
          >
            Type
          </SortableTh>
          <SortableTh<SortKey>
            sortKey="title"
            current={sortKey}
            dir={sortDir}
            onClick={toggleSort}
            className={contract.headerCell}
          >
            Title
          </SortableTh>
          <SortableTh<SortKey>
            sortKey="publishedAt"
            current={sortKey}
            dir={sortDir}
            onClick={toggleSort}
            className={contract.headerCell}
          >
            Date
          </SortableTh>
          <SortableTh<SortKey>
            sortKey="reach"
            current={sortKey}
            dir={sortDir}
            onClick={toggleSort}
            className={`${contract.headerCell} text-right`}
            align="right"
          >
            Reach
          </SortableTh>
          <SortableTh<SortKey>
            sortKey="engagement"
            current={sortKey}
            dir={sortDir}
            onClick={toggleSort}
            className={`${contract.headerCell} text-right`}
            align="right"
          >
            Engagement
          </SortableTh>
          {showCost && (
            <SortableTh<SortKey>
              sortKey="cost"
              current={sortKey}
              dir={sortDir}
              onClick={toggleSort}
              className={`${contract.headerCell} text-right`}
              align="right"
            >
              Cost
            </SortableTh>
          )}
          {showSentiment && <th className={contract.headerCell}>Sentiment</th>}
          <th className={contract.actionHeaderCell}>Actions</th>
        </tr>
      </thead>
      <tbody className={contract.body}>
        {sorted.length === 0 ? (
          <tr>
            <td colSpan={colCount} className="p-0">
              <EmptyState
                icon={<Newspaper />}
                title="No posts yet"
                description="Click 'Add post' to start tracking media performance."
                variant="inline"
              />
            </td>
          </tr>
        ) : (
          sorted.map((p) => {
            const canEdit = isAdmin || p.createdById === currentUserId;
            const meta = (p.meta ?? {}) as Record<string, unknown>;
            const sentiment = String(meta.sentiment ?? 'neutral');
            return (
              <tr key={p.id} className={contract.row}>
                <td className={contract.cell}>
                  <PlatformBadge platform={p.platform} />
                </td>
                <td className={contract.cell}>
                  <TypeBadge type={p.type} />
                </td>
                <td className={contract.cell}>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-on-surface">
                      {p.title ?? <span className="italic text-on-surface-variant/60">Untitled</span>}
                    </span>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[length:var(--text-caption)] text-primary hover:underline w-fit"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="size-3" aria-hidden="true" />
                        link
                      </a>
                    )}
                  </div>
                </td>
                <td className={contract.cell}>{format(new Date(p.publishedAt), 'yyyy-MM-dd')}</td>
                <td className={`${contract.cell} text-right`}>
                  <span className="font-headline font-bold">{fmtNumber(p.reach)}</span>
                </td>
                <td className={`${contract.cell} text-right`}>
                  <span className="font-headline font-bold">{fmtNumber(p.engagement)}</span>
                </td>
                {showCost && (
                  <td className={`${contract.cell} text-right`}>
                    {p.cost != null ? (
                      <span className="font-semibold">{Number(p.cost).toLocaleString('en-US')} VND</span>
                    ) : (
                      <span className="text-on-surface-variant/60">—</span>
                    )}
                  </td>
                )}
                {showSentiment && (
                  <td className={contract.cell}>
                    {p.type === 'PR' ? (
                      <SentimentBadge sentiment={sentiment} />
                    ) : (
                      <span className="text-on-surface-variant/60">—</span>
                    )}
                  </td>
                )}
                <td className={contract.actionCell}>
                  {canEdit && (
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconLeft={<Edit3 />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(p);
                          }}
                          aria-label="Edit post"
                        />
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconLeft={<Trash2 />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(p);
                          }}
                          aria-label="Delete post"
                          className="text-error hover:bg-error-container"
                        />
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </TableShell>
  );
}
