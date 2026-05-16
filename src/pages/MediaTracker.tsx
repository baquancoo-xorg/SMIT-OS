import { Suspense, useMemo, useState } from 'react';
import { Rss } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, EmptyState, GlassCard, PageSectionStack, Skeleton, StatBar } from '../components/ui';
import { MediaFilterBar } from '../components/features/media/media-filter-bar';
import { MediaPostsTable } from '../components/features/media/media-posts-table';
import { MediaGroupTable } from '../components/features/media/media-group-table';
import {
  useMediaPostsQuery,
  useMediaSyncMutation,
} from '../hooks/use-media-tracker';
import { useSocialChannelsList } from '../hooks/use-social-channels';
import type { MediaFilter, MediaPlatform } from '../hooks/use-media-tracker';
import type { ChannelOption } from '../components/features/media/media-filter-bar';

const PLATFORM_LABEL: Record<MediaPlatform, string> = {
  FACEBOOK_PAGE: 'Facebook Page',
  FACEBOOK_GROUP: 'Facebook Group',
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  THREADS: 'Threads',
};

const PLATFORM_DOT: Record<MediaPlatform, string> = {
  FACEBOOK_PAGE: 'bg-info',
  FACEBOOK_GROUP: 'bg-info/70',
  INSTAGRAM: 'bg-accent',
  TIKTOK: 'bg-on-surface-variant',
  YOUTUBE: 'bg-error',
  THREADS: 'bg-warning',
};

export default function MediaTrackerV5() {
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState<MediaFilter>({});

  const postsQuery = useMediaPostsQuery(filter);
  const channelsQuery = useSocialChannelsList();
  const syncMutation = useMediaSyncMutation();

  const posts = postsQuery.data?.posts ?? [];
  const groups = postsQuery.data?.groups ?? [];
  const isGrouped = !!filter.groupBy;

  const channels: ChannelOption[] = (channelsQuery.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    platform: c.platform,
  }));

  const patchFilter = (patch: Partial<MediaFilter>) =>
    setFilter((prev) => ({ ...prev, ...patch }));

  const statGroups = useMemo(() => {
    const byPlatform = new Map<MediaPlatform, number>();
    posts.forEach((p) => {
      const platform = p.channel.platform;
      byPlatform.set(platform, (byPlatform.get(platform) ?? 0) + 1);
    });
    const items = [
      { label: 'Total', value: posts.length, dotClass: 'bg-on-surface-variant' },
      ...(Object.keys(PLATFORM_LABEL) as MediaPlatform[])
        .filter((p) => (byPlatform.get(p) ?? 0) > 0)
        .map((p) => ({
          label: PLATFORM_LABEL[p],
          value: byPlatform.get(p) ?? 0,
          dotClass: PLATFORM_DOT[p],
        })),
    ];
    return [{ items }];
  }, [posts]);

  return (
    <PageSectionStack>
      <MediaFilterBar
        filter={filter}
        onChange={patchFilter}
        channels={channels}
        isSyncing={syncMutation.isPending}
        onRefresh={() => syncMutation.mutate()}
        showRefresh={isAdmin}
      />

      <GlassCard variant="surface" padding="sm" className="shrink-0">
        <StatBar groups={statGroups} />
      </GlassCard>

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
            {postsQuery.isError ? (
              <EmptyState
                variant="inline"
                title="Failed to load posts"
                description={(postsQuery.error as Error)?.message ?? 'Unknown error'}
              />
            ) : postsQuery.isLoading ? (
              <div className="flex flex-col gap-2 p-4">
                <Skeleton variant="rect" height={40} />
                <Skeleton variant="rect" height={40} />
                <Skeleton variant="rect" height={40} />
              </div>
            ) : isGrouped && groups.length === 0 ? (
              <EmptyState variant="inline" icon={<Rss />} title="No posts synced yet" description="Add a Social Channel in Integrations to start pulling posts." />
            ) : !isGrouped && posts.length === 0 ? (
              <EmptyState variant="inline" icon={<Rss />} title="No posts synced yet" description="Add a Social Channel in Integrations to start pulling posts." />
            ) : isGrouped ? (
              <MediaGroupTable groups={groups} />
            ) : (
              <MediaPostsTable posts={posts} />
            )}
          </Suspense>
        </Card>
      </section>
    </PageSectionStack>
  );
}
