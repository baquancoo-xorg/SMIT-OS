import { Suspense, useState } from 'react';
import { Rss } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, EmptyState, Skeleton } from '../../components/v5/ui';
import { MediaKpiSummary } from '../../components/v5/growth/media/media-kpi-summary';
import { MediaFilterBar } from '../../components/v5/growth/media/media-filter-bar';
import { MediaPostsTable } from '../../components/v5/growth/media/media-posts-table';
import { MediaGroupTable } from '../../components/v5/growth/media/media-group-table';
import {
  useMediaPostsQuery,
  useMediaKpiQuery,
  useMediaSyncMutation,
} from '../../hooks/use-media-tracker';
import { useSocialChannelsList } from '../../hooks/use-social-channels';
import type { MediaFilter } from '../../hooks/use-media-tracker';
import type { ChannelOption } from '../../components/v5/growth/media/media-filter-bar';

const DEFAULT_KPI = {
  totalPosts: 0,
  totalReach: 0,
  totalViews: 0,
  totalEngagement: 0,
  avgEngagementRate: 0,
};

function TableSection({ filter }: { filter: MediaFilter }) {
  const postsQuery = useMediaPostsQuery(filter);

  if (postsQuery.isError) {
    return (
      <EmptyState
        variant="inline"
        title="Failed to load posts"
        description={(postsQuery.error as Error)?.message ?? 'Unknown error'}
      />
    );
  }

  const data = postsQuery.data;
  const isGrouped = !!filter.groupBy;

  if (!postsQuery.isLoading && !data) return null;

  if (postsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <Skeleton variant="rect" height={40} />
        <Skeleton variant="rect" height={40} />
        <Skeleton variant="rect" height={40} />
      </div>
    );
  }

  const groups = data?.groups ?? [];
  const posts = data?.posts ?? [];

  if (isGrouped && groups.length === 0) {
    return <EmptyState variant="inline" icon={<Rss />} title="No posts synced yet" description="Add a Social Channel in Integrations to start pulling posts." />;
  }

  if (!isGrouped && posts.length === 0) {
    return <EmptyState variant="inline" icon={<Rss />} title="No posts synced yet" description="Add a Social Channel in Integrations to start pulling posts." />;
  }

  if (isGrouped) return <MediaGroupTable groups={groups} />;
  return <MediaPostsTable posts={posts} />;
}

export default function MediaTrackerV5() {
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState<MediaFilter>({});

  const kpiQuery = useMediaKpiQuery(filter);
  const channelsQuery = useSocialChannelsList();
  const syncMutation = useMediaSyncMutation();

  const kpi = kpiQuery.data ?? DEFAULT_KPI;

  const channels: ChannelOption[] = (channelsQuery.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    platform: c.platform,
  }));

  const patchFilter = (patch: Partial<MediaFilter>) =>
    setFilter((prev) => ({ ...prev, ...patch }));

  return (
    <div className="flex h-full flex-col gap-5 pb-8">
      {/* Filter bar */}
      <MediaFilterBar
        filter={filter}
        onChange={patchFilter}
        channels={channels}
        isSyncing={syncMutation.isPending}
        onRefresh={() => syncMutation.mutate()}
        showRefresh={isAdmin}
      />

      {/* KPI cards */}
      <MediaKpiSummary kpi={kpi} />

      {/* Posts / groups */}
      <section className="flex flex-1 min-h-0 flex-col" aria-label="Media posts">
        <Card padding="none" glow className="flex-1 min-h-0 overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex flex-col gap-2 p-4">
                <Skeleton variant="rect" height={40} />
                <Skeleton variant="rect" height={40} />
                <Skeleton variant="rect" height={40} />
              </div>
            }
          >
            <TableSection filter={filter} />
          </Suspense>
        </Card>
      </section>
    </div>
  );
}
