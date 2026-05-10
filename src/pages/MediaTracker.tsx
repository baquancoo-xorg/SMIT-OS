import { useMemo, useState } from 'react';
import { Globe, Mic, Newspaper, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MediaPostsTable from '../components/media-tracker/media-posts-table';
import MediaPostDialog from '../components/media-tracker/media-post-dialog';
import {
  useMediaPostsQuery,
  useCreateMediaPostMutation,
  useUpdateMediaPostMutation,
  useDeleteMediaPostMutation,
} from '../hooks/use-media-tracker';
import { exportMediaPostsToCsv } from '../components/media-tracker/csv-export';
import type { MediaPost, MediaPostType } from '../types';

type Tab = 'owned' | 'kol' | 'pr';

const TAB_TYPES: Record<Tab, MediaPostType[]> = {
  owned: ['ORGANIC'],
  kol: ['KOL', 'KOC'],
  pr: ['PR'],
};

const TAB_DEFAULT_TYPE: Record<Tab, MediaPostType> = {
  owned: 'ORGANIC',
  kol: 'KOL',
  pr: 'PR',
};

function fmtNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('en-US');
}

export default function MediaTracker() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('owned');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MediaPost | null>(null);

  const postsQuery = useMediaPostsQuery({});
  const createMutation = useCreateMediaPostMutation();
  const updateMutation = useUpdateMediaPostMutation();
  const deleteMutation = useDeleteMediaPostMutation();

  const allPosts = postsQuery.data ?? [];
  const filtered = useMemo(
    () => allPosts.filter((p) => TAB_TYPES[activeTab].includes(p.type)),
    [allPosts, activeTab]
  );

  const totals = useMemo(() => {
    const totalPosts = allPosts.length;
    const totalReach = allPosts.reduce((s, p) => s + p.reach, 0);
    const totalEngagement = allPosts.reduce((s, p) => s + p.engagement, 0);
    const kolSpend = allPosts
      .filter((p) => p.type === 'KOL' || p.type === 'KOC')
      .reduce((s, p) => s + (p.cost ?? 0), 0);
    return { totalPosts, totalReach, totalEngagement, kolSpend };
  }, [allPosts]);

  const handleSubmit = async (data: any) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setEditing(null);
    setDialogOpen(false);
  };

  const handleDelete = async (post: MediaPost) => {
    if (!window.confirm(`Delete "${post.title ?? post.url ?? post.id}"?`)) return;
    try {
      await deleteMutation.mutateAsync(post.id);
    } catch (err: any) {
      alert(err?.message ?? 'Delete failed');
    }
  };

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer transition-colors">Acquisition</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Media Tracker</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Media <span className="text-primary italic">Tracker</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const tabType = activeTab === 'kol' ? undefined : activeTab === 'pr' ? 'PR' : 'ORGANIC';
              exportMediaPostsToCsv(tabType ? { type: tabType as MediaPostType } : undefined).catch((err) =>
                alert(err?.message ?? 'Export failed')
              );
            }}
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-surface-container-high text-slate-600 hover:bg-slate-200 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <Download size={13} />
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="flex items-center justify-center gap-2 h-10 bg-primary text-white px-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all min-w-[130px] whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Add post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
        <KpiCard label="Total Posts" value={totals.totalPosts.toLocaleString()} highlight />
        <KpiCard label="Total Reach" value={fmtNumber(totals.totalReach)} />
        <KpiCard label="Total Engagement" value={fmtNumber(totals.totalEngagement)} />
        <KpiCard label="KOL/KOC Spend" value={totals.kolSpend.toLocaleString() + ' VND'} />
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="shrink-0 flex items-center">
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
            <TabBtn active={activeTab === 'owned'} onClick={() => setActiveTab('owned')} icon={<Globe size={10} />}>
              Owned
            </TabBtn>
            <TabBtn active={activeTab === 'kol'} onClick={() => setActiveTab('kol')} icon={<Mic size={10} />}>
              KOL/KOC
            </TabBtn>
            <TabBtn active={activeTab === 'pr'} onClick={() => setActiveTab('pr')} icon={<Newspaper size={10} />}>
              PR
            </TabBtn>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <MediaPostsTable
            posts={filtered}
            currentUserId={currentUser?.id}
            isAdmin={!!currentUser?.isAdmin}
            onEdit={(p) => {
              setEditing(p);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
            showCost={activeTab === 'kol' || activeTab === 'pr'}
            showSentiment={activeTab === 'pr'}
          />
        </div>
      </div>

      <MediaPostDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        defaultType={editing ? undefined : TAB_DEFAULT_TYPE[activeTab]}
      />
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

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 h-7 px-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
