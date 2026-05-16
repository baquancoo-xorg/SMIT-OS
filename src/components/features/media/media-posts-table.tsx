import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge, TableShell, SortableTh, formatTableDate, getTableContract } from '../../ui';
import { FormatIcon, formatLabel } from './format-icon';
import type { MediaPostDTO } from '../../../hooks/use-media-tracker';

type SortKey = 'publishedAt' | 'reach' | 'views' | 'engagement' | 'likes' | 'comments' | 'shares';
type SortDir = 'asc' | 'desc';

function fmt(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

const C = getTableContract('standard');

interface MediaPostsTableProps {
  posts: MediaPostDTO[];
}

export function MediaPostsTable({ posts }: MediaPostsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('publishedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [posts, sortKey, sortDir]);

  if (posts.length === 0) return null;

  return (
    <TableShell variant="standard">
      <thead>
        <tr className={C.headerRow}>
          <th className={`${C.headerCell} w-64`}>Post</th>
          <th className={C.headerCell}>Channel</th>
          <th className={C.headerCell}>Format</th>
          <SortableTh sortKey="publishedAt" current={sortKey} dir={sortDir} onClick={handleSort} className={C.headerCell}>Published</SortableTh>
          <SortableTh sortKey="reach"       current={sortKey} dir={sortDir} onClick={handleSort} className={C.headerCell} align="right">Reach</SortableTh>
          <SortableTh sortKey="views"       current={sortKey} dir={sortDir} onClick={handleSort} className={C.headerCell} align="right">Views</SortableTh>
          <SortableTh sortKey="engagement"  current={sortKey} dir={sortDir} onClick={handleSort} className={C.headerCell} align="right">Engagement</SortableTh>
          <SortableTh sortKey="likes"       current={sortKey} dir={sortDir} onClick={handleSort} className={C.headerCell} align="right">Likes</SortableTh>
          <SortableTh sortKey="comments"    current={sortKey} dir={sortDir} onClick={handleSort} className={C.headerCell} align="right">Comments</SortableTh>
          <SortableTh sortKey="shares"      current={sortKey} dir={sortDir} onClick={handleSort} className={C.headerCell} align="right">Shares</SortableTh>
          <th className={`${C.actionHeaderCell}`} aria-label="Link" />
        </tr>
      </thead>
      <tbody className={C.body}>
        {sorted.map((post) => (
          <tr key={post.id} className={C.row}>
            <td className={C.cell}>
              <div className="flex items-center gap-2 min-w-0">
                {post.thumbnailUrl && (
                  <img
                    src={post.thumbnailUrl}
                    alt=""
                    className="size-8 shrink-0 rounded object-cover"
                    loading="lazy"
                  />
                )}
                <span className="truncate text-on-surface" title={post.title ?? undefined}>
                  {post.title || post.content?.slice(0, 60) || (
                    <span className="text-on-surface-variant italic">No title</span>
                  )}
                </span>
              </div>
            </td>
            <td className={C.cell}>
              <Badge variant="neutral" size="sm">{post.channel.name}</Badge>
            </td>
            <td className={C.cell}>
              <span className="flex items-center gap-1.5">
                <FormatIcon format={post.format} />
                {formatLabel(post.format)}
              </span>
            </td>
            <td className={`${C.cell} text-on-surface-variant`}>
              {formatTableDate(post.publishedAt)}
            </td>
            <td className={`${C.cell} text-right tabular-nums`}>{fmt(post.reach)}</td>
            <td className={`${C.cell} text-right tabular-nums`}>{fmt(post.views)}</td>
            <td className={`${C.cell} text-right tabular-nums`}>{fmt(post.engagement)}</td>
            <td className={`${C.cell} text-right tabular-nums`}>{fmt(post.likes)}</td>
            <td className={`${C.cell} text-right tabular-nums`}>{fmt(post.comments)}</td>
            <td className={`${C.cell} text-right tabular-nums`}>{fmt(post.shares)}</td>
            <td className={C.actionCell}>
              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open post"
                  className="inline-flex text-on-surface-variant hover:text-on-surface"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}
