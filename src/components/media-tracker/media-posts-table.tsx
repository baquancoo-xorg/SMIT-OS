import { Edit3, ExternalLink, Trash2, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import type { MediaPost } from '../../types';
import PlatformBadge from './platform-badge';
import { DataTable, EmptyState, Badge, Button } from '../ui/v2';
import type { DataTableColumn } from '../ui/v2';

/**
 * Media posts table — owned/KOL/PR posts với reach, engagement, optional cost + sentiment.
 *
 * Phase 8 follow-up batch 3 (2026-05-10): migrated to v2 DataTable + Badge variants
 * + Button (ghost actions) + EmptyState. API identical.
 *
 * Type/sentiment use brand-specific colors (KOL pink, KOC orange, PR blue) — kept
 * inline since they map to fixed business taxonomy không phải v2 Badge semantic.
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

export default function MediaPostsTable({
  posts,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
  showCost,
  showSentiment,
}: Props) {
  const columns: DataTableColumn<MediaPost>[] = [
    {
      key: 'platform',
      label: 'Platform',
      render: (p) => <PlatformBadge platform={p.platform} />,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      sort: (a, b) => a.type.localeCompare(b.type),
      render: (p) => <TypeBadge type={p.type} />,
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      sort: (a, b) => (a.title ?? '').localeCompare(b.title ?? ''),
      render: (p) => (
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
      ),
    },
    {
      key: 'publishedAt',
      label: 'Date',
      hideBelow: 'md',
      sortable: true,
      sort: (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      render: (p) => format(new Date(p.publishedAt), 'yyyy-MM-dd'),
    },
    {
      key: 'reach',
      label: 'Reach',
      align: 'right',
      sortable: true,
      sort: (a, b) => a.reach - b.reach,
      render: (p) => <span className="font-headline font-bold">{fmtNumber(p.reach)}</span>,
    },
    {
      key: 'engagement',
      label: 'Engagement',
      align: 'right',
      sortable: true,
      sort: (a, b) => a.engagement - b.engagement,
      render: (p) => <span className="font-headline font-bold">{fmtNumber(p.engagement)}</span>,
    },
    ...(showCost
      ? [
          {
            key: 'cost',
            label: 'Cost',
            align: 'right' as const,
            hideBelow: 'lg' as const,
            sortable: true,
            sort: (a: MediaPost, b: MediaPost) => (a.cost ?? 0) - (b.cost ?? 0),
            render: (p: MediaPost) =>
              p.cost != null ? <span className="font-semibold">{p.cost.toLocaleString('en-US')} VND</span> : <span className="text-on-surface-variant/60">—</span>,
          },
        ]
      : []),
    ...(showSentiment
      ? [
          {
            key: 'sentiment',
            label: 'Sentiment',
            hideBelow: 'lg' as const,
            render: (p: MediaPost) => {
              const meta = (p.meta ?? {}) as Record<string, any>;
              const sentiment = String(meta.sentiment ?? 'neutral');
              return p.type === 'PR' ? (
                <SentimentBadge sentiment={sentiment} />
              ) : (
                <span className="text-on-surface-variant/60">—</span>
              );
            },
          },
        ]
      : []),
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      width: 'w-24',
      render: (p) => {
        const canEdit = isAdmin || p.createdById === currentUserId;
        if (!canEdit) return null;
        return (
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
        );
      },
    },
  ];

  return (
    <DataTable<MediaPost>
      label="Media posts"
      data={posts}
      columns={columns}
      rowKey={(p) => p.id}
      density="comfortable"
      empty={
        <EmptyState
          icon={<Newspaper />}
          title="No posts yet"
          description="Click 'Add post' to start tracking media performance."
          variant="inline"
        />
      }
    />
  );
}
