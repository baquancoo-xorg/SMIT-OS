import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Newspaper, Eye, DollarSign, Mic, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { useMediaPostsQuery } from '../../../hooks/use-media-tracker';
import PlatformBadge from '../../media-tracker/platform-badge';
import { GlassCard, KpiCard, Badge, EmptyState } from '../../v5/ui';

/**
 * Dashboard Media tab — compact summary KOL/KOC + PR.
 *
 * Phase 8 follow-up batch 13 (2026-05-11): full migration to v2 primitives.
 * - 4 inline KpiCard helpers → v2 KpiCard (Bento decorative)
 * - 2 panels (KOL + PR) → v2 GlassCard wrappers
 * - PR sentiment badges → v2 Badge variants (success/error/neutral)
 * - EmptyState v2 cho zero data
 */

interface Props {
  from: string;
  to: string;
}

function fmtNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('en-US');
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const variant = sentiment === 'positive' ? 'success' : sentiment === 'negative' ? 'error' : 'neutral';
  return <Badge variant={variant}>{sentiment}</Badge>;
}

export default function MediaTab({ from, to }: Props) {
  const postsQuery = useMediaPostsQuery({ from, to });
  const posts = postsQuery.data ?? [];

  const totals = useMemo(() => {
    const totalPosts = posts.length;
    const totalReach = posts.reduce((s, p) => s + p.reach, 0);
    const kolSpend = posts
      .filter((p) => p.type === 'KOL' || p.type === 'KOC')
      .reduce((s, p) => s + Number(p.cost ?? 0), 0);
    const prCount = posts.filter((p) => p.type === 'PR').length;
    return { totalPosts, totalReach, kolSpend, prCount };
  }, [posts]);

  const topKol = useMemo(() => {
    return posts
      .filter((p) => p.type === 'KOL' || p.type === 'KOC')
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);
  }, [posts]);

  const recentPr = useMemo(() => {
    return posts
      .filter((p) => p.type === 'PR')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5);
  }, [posts]);

  return (
    <div className="space-y-[var(--space-lg)]">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard label="Total Posts" value={totals.totalPosts} icon={<Newspaper />} accent="primary" decorative />
        <KpiCard label="Total Reach" value={fmtNumber(totals.totalReach)} icon={<Eye />} accent="info" />
        <KpiCard
          label="KOL/KOC Spend"
          value={totals.kolSpend.toLocaleString()}
          unit="VND"
          icon={<DollarSign />}
          accent="warning"
        />
        <KpiCard label="PR Mentions" value={totals.prCount} icon={<Megaphone />} accent="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GlassCard variant="surface" padding="md" className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-32 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative mb-4 flex items-center justify-between">
            <h3 className="font-headline text-[length:var(--text-h5)] font-bold text-on-surface">
              Top <em className="font-medium text-primary italic">KOL/KOC</em>
            </h3>
            <Link
              to="/media-tracker"
              className="inline-flex items-center gap-1 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-primary hover:underline"
            >
              View all <ExternalLink size={10} />
            </Link>
          </div>
          <div className="relative space-y-2">
            {topKol.length === 0 ? (
              <EmptyState icon={<Mic />} title="No KOL/KOC posts yet" variant="inline" />
            ) : (
              topKol.map((p) => {
                const meta = (p.meta ?? {}) as Record<string, any>;
                const name = meta.kolName ?? meta.kocName ?? p.title ?? 'Untitled';
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-card p-2 transition hover:bg-surface-container-low">
                    <PlatformBadge platform={p.platform} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[length:var(--text-body-sm)] font-medium text-on-surface">{name}</p>
                      <p className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                        {fmtNumber(p.engagement)} eng · {fmtNumber(p.reach)} reach
                      </p>
                    </div>
                    {p.cost != null && Number(p.cost) > 0 && (
                      <span className="text-[length:var(--text-caption)] font-semibold text-on-surface-variant">
                        {fmtNumber(Number(p.cost))} VND
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        <GlassCard variant="surface" padding="md" className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-32 rounded-full bg-info/10 blur-3xl" />
          <div className="relative mb-4 flex items-center justify-between">
            <h3 className="font-headline text-[length:var(--text-h5)] font-bold text-on-surface">
              Recent <em className="font-medium text-primary italic">PR</em>
            </h3>
            <Link
              to="/media-tracker"
              className="inline-flex items-center gap-1 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-primary hover:underline"
            >
              View all <ExternalLink size={10} />
            </Link>
          </div>
          <div className="relative space-y-2">
            {recentPr.length === 0 ? (
              <EmptyState icon={<Newspaper />} title="No PR mentions yet" variant="inline" />
            ) : (
              recentPr.map((p) => {
                const meta = (p.meta ?? {}) as Record<string, any>;
                const sentiment = String(meta.sentiment ?? 'neutral');
                const outlet = meta.outlet ?? p.title ?? 'Unknown outlet';
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-card p-2 transition hover:bg-surface-container-low">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[length:var(--text-body-sm)] font-medium text-on-surface">{outlet}</p>
                      <p className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                        {format(new Date(p.publishedAt), 'yyyy-MM-dd')} · {fmtNumber(p.reach)} reach
                      </p>
                    </div>
                    <SentimentBadge sentiment={sentiment} />
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
