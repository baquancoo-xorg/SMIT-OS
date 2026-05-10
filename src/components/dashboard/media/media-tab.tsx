import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useMediaPostsQuery } from '../../../hooks/use-media-tracker';
import PlatformBadge from '../../media-tracker/platform-badge';

interface Props {
  from: string;
  to: string;
}

function fmtNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('en-US');
}

const SENTIMENT_BADGE: Record<string, string> = {
  positive: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  neutral: 'bg-slate-100 text-slate-500 border-slate-200',
  negative: 'bg-error/10 text-error border-error/20',
};

export default function MediaTab({ from, to }: Props) {
  const postsQuery = useMediaPostsQuery({ from, to });
  const posts = postsQuery.data ?? [];

  const totals = useMemo(() => {
    const totalPosts = posts.length;
    const totalReach = posts.reduce((s, p) => s + p.reach, 0);
    const kolSpend = posts
      .filter((p) => p.type === 'KOL' || p.type === 'KOC')
      .reduce((s, p) => s + (p.cost ?? 0), 0);
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
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Posts" value={String(totals.totalPosts)} highlight />
        <KpiCard label="Total Reach" value={fmtNumber(totals.totalReach)} />
        <KpiCard label="KOL/KOC Spend" value={totals.kolSpend.toLocaleString() + ' VND'} />
        <KpiCard label="PR Mentions" value={String(totals.prCount)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm p-4 xl:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E60076]/5 rounded-full -mr-16 -mt-16" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-2xl font-black font-headline">
              Top <span className="text-primary italic">KOL/KOC</span>
            </h3>
            <Link
              to="/media-tracker"
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
            >
              View all <ExternalLink size={10} />
            </Link>
          </div>
          <div className="space-y-2 relative z-10">
            {topKol.length === 0 ? (
              <p className="text-center py-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                No KOL/KOC posts yet
              </p>
            ) : (
              topKol.map((p) => {
                const meta = (p.meta ?? {}) as Record<string, any>;
                const name = meta.kolName ?? meta.kocName ?? p.title ?? 'Untitled';
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/40 transition"
                  >
                    <PlatformBadge platform={p.platform} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {fmtNumber(p.engagement)} eng · {fmtNumber(p.reach)} reach
                      </p>
                    </div>
                    {p.cost && (
                      <span className="text-xs font-bold text-on-surface-variant">
                        {fmtNumber(p.cost)} VND
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm p-4 xl:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0059B6]/5 rounded-full -mr-16 -mt-16" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-2xl font-black font-headline">
              Recent <span className="text-primary italic">PR</span>
            </h3>
            <Link
              to="/media-tracker"
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
            >
              View all <ExternalLink size={10} />
            </Link>
          </div>
          <div className="space-y-2 relative z-10">
            {recentPr.length === 0 ? (
              <p className="text-center py-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                No PR mentions yet
              </p>
            ) : (
              recentPr.map((p) => {
                const meta = (p.meta ?? {}) as Record<string, any>;
                const sentiment = String(meta.sentiment ?? 'neutral');
                const outlet = meta.outlet ?? p.title ?? 'Unknown outlet';
                return (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/40 transition">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{outlet}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {format(new Date(p.publishedAt), 'yyyy-MM-dd')} · {fmtNumber(p.reach)} reach
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                        SENTIMENT_BADGE[sentiment] ?? SENTIMENT_BADGE.neutral
                      }`}
                    >
                      {sentiment}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div className="bg-primary text-white p-4 xl:p-6 rounded-3xl shadow-xl shadow-primary/20 flex flex-col gap-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 xl:w-32 xl:h-32 bg-white/10 rounded-full -mr-10 -mt-10 xl:-mr-16 xl:-mt-16 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 relative z-10">{label}</p>
        <h4 className="text-2xl xl:text-4xl font-black font-headline relative z-10">{value}</h4>
      </div>
    );
  }
  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 p-4 xl:p-6 rounded-3xl shadow-sm flex flex-col gap-2 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 xl:w-32 xl:h-32 bg-primary/5 rounded-full -mr-10 -mt-10 xl:-mr-16 xl:-mt-16 group-hover:scale-150 transition-transform duration-700" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{label}</p>
      <h4 className="text-2xl xl:text-4xl font-black font-headline relative z-10">{value}</h4>
    </div>
  );
}
