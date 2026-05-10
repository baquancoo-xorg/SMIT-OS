import { Edit3, ExternalLink, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { MediaPost } from '../../types';
import PlatformBadge from './platform-badge';

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

const SENTIMENT_BADGE: Record<string, string> = {
  positive: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  neutral: 'bg-slate-100 text-slate-500 border-slate-200',
  negative: 'bg-error/10 text-error border-error/20',
};

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
  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/40">
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Reach</th>
              <th className="px-4 py-3 text-right">Engagement</th>
              {showCost && <th className="px-4 py-3 text-right">Cost</th>}
              {showSentiment && <th className="px-4 py-3">Sentiment</th>}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td
                  colSpan={showCost && showSentiment ? 9 : showCost || showSentiment ? 8 : 7}
                  className="text-center py-12 text-slate-400 font-black uppercase tracking-widest text-[10px]"
                >
                  No posts yet — click <span className="text-primary">Add post</span> to start
                </td>
              </tr>
            ) : (
              posts.map((p) => {
                const meta = (p.meta ?? {}) as Record<string, any>;
                const sentiment = String(meta.sentiment ?? 'neutral') as keyof typeof SENTIMENT_BADGE;
                const canEdit = isAdmin || p.createdById === currentUserId;
                return (
                  <tr key={p.id} className="border-b border-white/30 hover:bg-white/40 transition-colors">
                    <td className="px-4 py-3">
                      <PlatformBadge platform={p.platform} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                          TYPE_BADGE[p.type] ?? 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-on-surface">
                        {p.title ?? <span className="text-slate-300">Untitled</span>}
                      </div>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink size={10} />
                          link
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {format(new Date(p.publishedAt), 'yyyy-MM-dd')}
                    </td>
                    <td className="px-4 py-3 text-right font-headline font-black">{fmtNumber(p.reach)}</td>
                    <td className="px-4 py-3 text-right font-headline font-black">{fmtNumber(p.engagement)}</td>
                    {showCost && (
                      <td className="px-4 py-3 text-right text-xs font-bold">
                        {p.cost != null ? p.cost.toLocaleString('en-US') + ' VND' : '—'}
                      </td>
                    )}
                    {showSentiment && (
                      <td className="px-4 py-3">
                        {p.type === 'PR' ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${SENTIMENT_BADGE[sentiment]}`}
                          >
                            {sentiment}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && onEdit && (
                          <button
                            onClick={() => onEdit(p)}
                            className="p-1.5 hover:bg-slate-100 rounded-full transition"
                            title="Edit"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}
                        {canEdit && onDelete && (
                          <button
                            onClick={() => onDelete(p)}
                            className="p-1.5 hover:bg-error/10 text-error rounded-full transition"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
