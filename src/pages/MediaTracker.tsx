import { useMemo, useState } from 'react';
import { Globe, Mic, Newspaper, Plus, Eye, Heart, DollarSign, Newspaper as NewspaperIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MediaPostsTable from '../components/media-tracker/media-posts-table';
import MediaPostDialog from '../components/media-tracker/media-post-dialog';
import {
  useMediaPostsQuery,
  useCreateMediaPostMutation,
  useUpdateMediaPostMutation,
  useDeleteMediaPostMutation,
} from '../hooks/use-media-tracker';
import type { MediaPost, MediaPostType } from '../types';
import {
  Button,
  TabPill,
  KpiCard,
  GlassCard,
} from '../components/ui';
import type { TabPillItem } from '../components/ui';

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

const TABS: TabPillItem<Tab>[] = [
  { value: 'owned', label: 'Owned', icon: <Globe /> },
  { value: 'kol', label: 'KOL/KOC', icon: <Mic /> },
  { value: 'pr', label: 'PR', icon: <Newspaper /> },
];

function fmtNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('en-US');
}

/**
 * MediaTracker v2 — Phase 6 medium pages migration.
 *
 * Token-driven shell wrapping v1 sub-components (MediaPostsTable, MediaPostDialog):
 *  - PageHeader (italic accent + breadcrumb)
 *  - KpiCard (Bento) for headline metrics
 *  - TabPill (Owned / KOL/KOC / PR)
 *  - v2 Button for Add post + Export CSV
 *
 * Tab type filter forwarded to MediaPostsTable. Owned tab hides cost column.
 */
export default function MediaTrackerV2() {
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
    [allPosts, activeTab],
  );

  const totals = useMemo(() => {
    const totalPosts = allPosts.length;
    const totalReach = allPosts.reduce((s, p) => s + p.reach, 0);
    const totalEngagement = allPosts.reduce((s, p) => s + p.engagement, 0);
    const kolSpend = allPosts
      .filter((p) => p.type === 'KOL' || p.type === 'KOC')
      .reduce((s, p) => s + Number(p.cost ?? 0), 0);
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
    <div className="flex h-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-headline text-[length:var(--text-h2)] font-bold leading-tight text-on-surface min-w-0">
          Media <span className="font-semibold text-primary">Tracker</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <TabPill<Tab> label="Media tracker tabs" value={activeTab} onChange={setActiveTab} items={TABS} size="sm" />
          <Button
            variant="primary"
            size="sm"
            iconLeft={<Plus />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Add post
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard label="Total Posts" value={totals.totalPosts.toLocaleString()} icon={<NewspaperIcon />} accent="primary" />
        <KpiCard label="Total Reach" value={fmtNumber(totals.totalReach)} icon={<Eye />} accent="info" />
        <KpiCard label="Total Engagement" value={fmtNumber(totals.totalEngagement)} icon={<Heart />} accent="success" />
        <KpiCard
          label="KOL/KOC Spend"
          value={totals.kolSpend.toLocaleString()}
          unit="VND"
          icon={<DollarSign />}
          accent="warning"
        />
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-4">
        <GlassCard variant="surface" padding="none" className="flex-1 min-h-0 overflow-y-auto">
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
        </GlassCard>
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
