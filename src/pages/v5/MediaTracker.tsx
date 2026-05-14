import { useMemo, useState } from 'react';
import { Globe, Mic, Newspaper, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MediaPostDialog from '../../components/media-tracker/media-post-dialog';
import MediaPostsTable from '../../components/media-tracker/media-posts-table';
import { MediaKpiSummary } from '../../components/v5/growth/media/media-kpi-summary';
import { Button, Card, TabPill } from '../../components/v5/ui';
import type { TabPillItem } from '../../components/v5/ui';
import {
  useCreateMediaPostMutation,
  useDeleteMediaPostMutation,
  useMediaPostsQuery,
  useUpdateMediaPostMutation,
} from '../../hooks/use-media-tracker';
import type { MediaPost, MediaPostType } from '../../types';

type Tab = 'owned' | 'kol' | 'pr';

const tabTypes: Record<Tab, MediaPostType[]> = {
  owned: ['ORGANIC'],
  kol: ['KOL', 'KOC'],
  pr: ['PR'],
};

const defaultType: Record<Tab, MediaPostType> = {
  owned: 'ORGANIC',
  kol: 'KOL',
  pr: 'PR',
};

const tabs: TabPillItem<Tab>[] = [
  { value: 'owned', label: 'Owned', icon: <Globe /> },
  { value: 'kol', label: 'KOL/KOC', icon: <Mic /> },
  { value: 'pr', label: 'PR', icon: <Newspaper /> },
];

export default function MediaTrackerV5() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('owned');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MediaPost | null>(null);

  const postsQuery = useMediaPostsQuery({});
  const createMutation = useCreateMediaPostMutation();
  const updateMutation = useUpdateMediaPostMutation();
  const deleteMutation = useDeleteMediaPostMutation();

  const allPosts = postsQuery.data ?? [];
  const filtered = useMemo(() => allPosts.filter((post) => tabTypes[activeTab].includes(post.type)), [allPosts, activeTab]);
  const totals = useMemo(() => {
    const totalPosts = allPosts.length;
    const totalReach = allPosts.reduce((sum, post) => sum + post.reach, 0);
    const totalEngagement = allPosts.reduce((sum, post) => sum + post.engagement, 0);
    const kolSpend = allPosts
      .filter((post) => post.type === 'KOL' || post.type === 'KOC')
      .reduce((sum, post) => sum + Number(post.cost ?? 0), 0);
    return { totalPosts, totalReach, totalEngagement, kolSpend };
  }, [allPosts]);

  const handleSubmit = async (data: any) => {
    try {
      if (editing) await updateMutation.mutateAsync({ id: editing.id, data });
      else await createMutation.mutateAsync(data);
      setEditing(null);
      setDialogOpen(false);
    } catch (err: any) {
      alert(err?.message ?? 'Save failed');
    }
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
    <div className="flex h-full flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-center justify-end gap-2">
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

      <div className="overflow-x-auto pb-1">
        <TabPill<Tab> label="Media tracker tabs" value={activeTab} onChange={setActiveTab} items={tabs} size="sm" className="min-w-max" />
      </div>

      <MediaKpiSummary {...totals} />

      <section className="flex flex-1 min-h-0 flex-col" aria-label="Media tracker content">
        <Card padding="none" glow className="flex-1 min-h-0 overflow-y-auto">
          <MediaPostsTable
            posts={filtered}
            currentUserId={currentUser?.id}
            isAdmin={!!currentUser?.isAdmin}
            onEdit={(post) => {
              setEditing(post);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
            showCost={activeTab === 'kol' || activeTab === 'pr'}
            showSentiment={activeTab === 'pr'}
          />
        </Card>
      </section>

      <MediaPostDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        defaultType={editing ? undefined : defaultType[activeTab]}
      />
    </div>
  );
}
