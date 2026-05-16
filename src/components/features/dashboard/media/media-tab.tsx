import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Newspaper, Eye, Mic, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useMediaPostsQuery } from '../../../../hooks/use-media-tracker';
import { GlassCard, KpiCard, Badge, EmptyState, SectionCard } from '../../../ui';

/**
 * Dashboard Media tab — compact summary.
 * Updated Phase 05 to use new MediaPostDTO shape from auto-pull API.
 */

interface Props {
  from: string;
  to: string;
}

function fmtNumber(n: number | null | undefined) {
  if (n == null) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('en-US');
}

export default function MediaTab({ from, to }: Props) {
  const postsQuery = useMediaPostsQuery({ from, to });
  const posts = postsQuery.data?.posts ?? [];

  const totals = useMemo(() => {
    const totalPosts = posts.length;
    const totalReach = posts.reduce((s, p) => s + (p.reach ?? 0), 0);
    const totalEngagement = posts.reduce((s, p) => s + (p.engagement ?? 0), 0);
    return { totalPosts, totalReach, totalEngagement };
  }, [posts]);

  const topEngaged = useMemo(() => {
    return [...posts]
      .sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0))
      .slice(0, 5);
  }, [posts]);

  const recent = useMemo(() => {
    return [...posts]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5);
  }, [posts]);

  return (
    <SectionCard eyebrow="Media" title="Content Operations">
      <div className="space-y-[var(--space-lg)]">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard label="Total Posts"      value={totals.totalPosts}                 icon={<Newspaper />}     accent="primary" decorative />
        <KpiCard label="Total Reach"      value={fmtNumber(totals.totalReach)}      icon={<Eye />}           accent="info" />
        <KpiCard label="Total Engagement" value={fmtNumber(totals.totalEngagement)} icon={<MessageSquare />} accent="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GlassCard variant="surface" padding="md" className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-32 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative mb-4 flex items-center justify-between">
            <h3 className="font-headline text-[length:var(--text-h5)] font-bold text-on-surface">
              Top <em className="font-medium text-primary italic">Engaged</em>
            </h3>
            <Link to="/v5/media" className="inline-flex items-center gap-1 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-primary hover:underline">
              View all <ExternalLink size={10} />
            </Link>
          </div>
          <div className="relative space-y-2">
            {topEngaged.length === 0 ? (
              <EmptyState icon={<Mic />} title="No posts yet" variant="inline" />
            ) : (
              topEngaged.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-card p-2 transition hover:bg-surface-container-low">
                  <Badge variant="neutral" size="sm">{p.channel.platform}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[length:var(--text-body-sm)] font-medium text-on-surface">
                      {p.title ?? p.content?.slice(0, 50) ?? 'Untitled'}
                    </p>
                    <p className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                      {fmtNumber(p.engagement)} eng · {fmtNumber(p.reach)} reach
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard variant="surface" padding="md" className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-32 rounded-full bg-info/10 blur-3xl" />
          <div className="relative mb-4 flex items-center justify-between">
            <h3 className="font-headline text-[length:var(--text-h5)] font-bold text-on-surface">
              Recent <em className="font-medium text-primary italic">Posts</em>
            </h3>
            <Link to="/v5/media" className="inline-flex items-center gap-1 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-primary hover:underline">
              View all <ExternalLink size={10} />
            </Link>
          </div>
          <div className="relative space-y-2">
            {recent.length === 0 ? (
              <EmptyState icon={<Newspaper />} title="No posts yet" variant="inline" />
            ) : (
              recent.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-card p-2 transition hover:bg-surface-container-low">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[length:var(--text-body-sm)] font-medium text-on-surface">
                      {p.title ?? p.content?.slice(0, 50) ?? 'Untitled'}
                    </p>
                    <p className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                      {format(new Date(p.publishedAt), 'yyyy-MM-dd')} · {p.channel.name}
                    </p>
                  </div>
                  <Badge variant="neutral" size="sm">{p.format}</Badge>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
      </div>
    </SectionCard>
  );
}
