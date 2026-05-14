import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Badge } from '../../ui';
import { MediaPostsTable } from './media-posts-table';
import type { MediaPostGroup } from '../../../../hooks/use-media-tracker';

function fmt(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

interface GroupRowProps {
  group: MediaPostGroup;
  isOpen: boolean;
  onToggle: () => void;
}

function GroupRow({ group, isOpen, onToggle }: GroupRowProps) {
  const summary = group.summary as {
    totalReach?: number;
    totalViews?: number;
    totalEngagement?: number;
  };

  return (
    <div className="rounded-card border border-outline-variant/40 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 bg-surface-container-low hover:bg-surface-container text-left transition-colors focus-visible:outline-none"
        aria-expanded={isOpen}
      >
        <ChevronRight
          className={`size-4 shrink-0 text-on-surface-variant transition-transform duration-fast ${isOpen ? 'rotate-90' : ''}`}
          aria-hidden="true"
        />
        <span className="flex-1 font-semibold text-[length:var(--text-body-sm)] text-on-surface">
          {group.key}
        </span>
        <Badge variant="neutral" size="sm">{group.count} posts</Badge>
        {summary.totalReach != null && (
          <span className="text-[length:var(--text-caption)] text-on-surface-variant tabular-nums">
            Reach {fmt(summary.totalReach)}
          </span>
        )}
        {summary.totalEngagement != null && (
          <span className="text-[length:var(--text-caption)] text-on-surface-variant tabular-nums">
            Eng. {fmt(summary.totalEngagement)}
          </span>
        )}
      </button>

      {isOpen && group.posts.length > 0 && (
        <div className="border-t border-outline-variant/40">
          <MediaPostsTable posts={group.posts} />
        </div>
      )}

      {isOpen && group.posts.length === 0 && (
        <p className="px-4 py-3 text-[length:var(--text-body-sm)] text-on-surface-variant italic">
          No posts in this group.
        </p>
      )}
    </div>
  );
}

interface MediaGroupTableProps {
  groups: MediaPostGroup[];
}

export function MediaGroupTable({ groups }: MediaGroupTableProps) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => {
    // Open first group by default
    if (groups.length > 0) return new Set([groups[0].key]);
    return new Set();
  });

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <GroupRow
          key={group.key}
          group={group}
          isOpen={openKeys.has(group.key)}
          onToggle={() => toggle(group.key)}
        />
      ))}
    </div>
  );
}
