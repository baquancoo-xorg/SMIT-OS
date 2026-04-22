import { useState, useEffect, useCallback } from 'react';
import { WorkItem, WorkItemType } from '../types';
import { Filter } from 'lucide-react';
import PrimaryActionButton from '../components/ui/PrimaryActionButton';
import { useAuth } from '../contexts/AuthContext';
import TaskModal from '../components/board/TaskModal';
import EpicCard from '../components/board/epic-card';
import EpicDetailPanel from '../components/board/epic-detail-panel';
import CustomFilter from '../components/ui/CustomFilter';

function getDescendants(epicId: string, allItems: WorkItem[]): WorkItem[] {
  const direct = allItems.filter(i => i.parentId === epicId);
  return direct.flatMap(child => [child, ...getDescendants(child.id, allItems)]);
}

function computeEpicProgress(epicId: string, allItems: WorkItem[]) {
  const all = getDescendants(epicId, allItems);
  const tasks = all.filter(i => i.type !== 'Epic' && i.type !== 'UserStory');
  const done = tasks.filter(t => t.status === 'Done').length;
  return { total: tasks.length, done, pct: tasks.length ? Math.round(done / tasks.length * 100) : 0 };
}

export default function EpicBoard({ hideHeader = false }: { hideHeader?: boolean }) {
  const [allItems, setAllItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedEpic, setSelectedEpic] = useState<WorkItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<WorkItem | null>(null);
  const { users } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/work-items');
      if (res.ok) {
        const data: WorkItem[] = await res.json();
        setAllItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch work items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveEpic = async (epic: WorkItem) => {
    try {
      if (editingEpic) {
        const res = await fetch(`/api/work-items/${editingEpic.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(epic),
        });
        const data = await res.json();
        setAllItems(prev => prev.map(i => i.id === data.id ? data : i));
        if (selectedEpic?.id === data.id) setSelectedEpic(data);
      } else {
        const res = await fetch('/api/work-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...epic, id: undefined }),
        });
        const data = await res.json();
        setAllItems(prev => [data, ...prev]);
      }
      setEditingEpic(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save epic:', error);
    }
  };

  const handleDeleteEpic = async (id: string) => {
    try {
      await fetch(`/api/work-items/${id}`, { method: 'DELETE' });
      setAllItems(prev => prev.filter(i => i.id !== id));
      if (selectedEpic?.id === id) { setSelectedEpic(null); setIsPanelOpen(false); }
    } catch (error) {
      console.error('Failed to delete epic:', error);
    }
  };

  const epics = allItems
    .filter(i => i.type === 'Epic')
    .filter(i => statusFilter === 'All' || i.status === statusFilter);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      {/* Header */}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
          <div>
            <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
              <span className="hover:text-primary cursor-pointer">Planning</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-on-surface">Epic Board</span>
            </nav>
            <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
              Epic <span className="text-purple-600 italic">Board</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <CustomFilter
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Todo', label: 'Active' },
                { value: 'InProgress', label: 'Active' },
                { value: 'Done', label: 'Done' },
              ]}
              icon={<Filter size={14} />}
            />
            <PrimaryActionButton onClick={() => { setEditingEpic(null); setIsModalOpen(true); }}>
              New Epic
            </PrimaryActionButton>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl shadow-sm shrink-0">
        <div className="text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Epics</p>
          <p className="text-2xl font-black font-headline text-on-surface">{epics.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active</p>
          <p className="text-2xl font-black font-headline text-purple-600">
            {epics.filter(e => computeEpicProgress(e.id, allItems).pct > 0 && computeEpicProgress(e.id, allItems).pct < 100).length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Completed</p>
          <p className="text-2xl font-black font-headline text-emerald-600">
            {epics.filter(e => { const p = computeEpicProgress(e.id, allItems); return p.total > 0 && p.pct === 100; }).length}
          </p>
        </div>
      </div>

      {/* Epic Grid */}
      <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
        {epics.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-slate-50/50 border-2 border-dashed border-outline-variant/10 rounded-3xl">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">flag</span>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">No Epics yet</p>
            <p className="text-slate-300 text-xs font-medium">Create your first Epic to start organizing your work.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {epics.map(epic => {
              const progress = computeEpicProgress(epic.id, allItems);
              const storyCount = allItems.filter(i => i.parentId === epic.id && i.type === 'UserStory').length;
              return (
                <EpicCard
                  key={epic.id}
                  epic={epic}
                  progress={progress}
                  storyCount={storyCount}
                  users={users}
                  onSelect={() => { setSelectedEpic(epic); setIsPanelOpen(true); }}
                  onEdit={() => { setEditingEpic(epic); setIsModalOpen(true); }}
                  onDelete={() => handleDeleteEpic(epic.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEpic(null); }}
        onSave={handleSaveEpic}
        defaultType="Epic"
        allowedTypes={['Epic'] as WorkItemType[]}
        initialData={editingEpic}
      />

      {selectedEpic && (
        <EpicDetailPanel
          epic={selectedEpic}
          allItems={allItems}
          users={users}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
