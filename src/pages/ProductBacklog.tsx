import { useState, useEffect } from 'react';
import { WorkItem, WorkItemType, BACKLOG_TYPES } from '../types';
import { motion } from 'motion/react';
import {
  Plus, Search, Filter, Trash2,
  ChevronDown, ChevronRight, Inbox, Calendar, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TaskModal from '../components/board/TaskModal';
import TaskDetailsModal from '../components/board/TaskDetailsModal';
import CustomFilter from '../components/ui/CustomFilter';
import ViewToggle from '../components/ui/ViewToggle';
import PrimaryActionButton from '../components/ui/PrimaryActionButton';
import { TableRowActions } from '../components/ui/TableRowActions';
import { TableShell } from '../components/ui/TableShell';
import { getTableContract } from '../components/ui/table-contract';
import { formatTableDate } from '../components/ui/table-date-format';
import EpicBoard from './EpicBoard';
import EpicGraph from './EpicGraph';

export default function ProductBacklog() {
  const [view, setView] = useState<'grouped' | 'table' | 'epic-board' | 'epic-graph'>('grouped');
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkItem | null>(null);
  const [viewingTask, setViewingTask] = useState<WorkItem | null>(null);
  const [newItemDefaultParentId, setNewItemDefaultParentId] = useState<string | undefined>(undefined);
  const [newItemDefaultType, setNewItemDefaultType] = useState<WorkItemType>('Epic');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'dueDate'>('createdAt');
  const { users } = useAuth();

  const fetchData = async () => {
    try {
      const res = await fetch('/api/work-items');
      if (res.ok) {
        const data: WorkItem[] = await res.json();
        // Team Backlog: Only Epic and UserStory
        const backlogItems = data.filter((item: WorkItem) =>
          BACKLOG_TYPES.includes(item.type as WorkItemType)
        );
        setItems(backlogItems);
      }
    } catch (error) {
      console.error('Failed to fetch backlog items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (newTask: WorkItem) => {
    try {
      if (editingTask) {
        const res = await fetch(`/api/work-items/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update item');
        }
        const data = await res.json();
        setItems(prev => prev.map(item => item.id === data.id ? data : item));
      } else {
        const res = await fetch('/api/work-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newTask,
            id: undefined,
            sprintId: null
          })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to create item');
        }
        const data = await res.json();
        setItems(prev => [data, ...prev]);
      }
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to save task:', error);
      alert(error?.message || 'Failed to save item');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await fetch(`/api/work-items/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(item => item.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id =>
        fetch(`/api/work-items/${id}`, { method: 'DELETE' })
      ));
      setItems(prev => prev.filter(item => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to bulk delete tasks:', error);
    }
  };

  const handleEditTask = (item: WorkItem) => {
    setEditingTask(item);
    setNewItemDefaultParentId(undefined);
    setIsModalOpen(true);
  };

  const handleAddStory = (epicId: string) => {
    setEditingTask(null);
    setNewItemDefaultParentId(epicId);
    setNewItemDefaultType('UserStory');
    setIsModalOpen(true);
  };

  const handleViewDetails = (item: WorkItem) => {
    setViewingTask(item);
    setIsDetailsModalOpen(true);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const getPriorityWeight = (p: string) => {
    return p === 'Urgent' ? 4 : p === 'High' ? 3 : p === 'Medium' ? 2 : 1;
  };

  const filteredItems = items
    .filter(item => {
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter !== 'All' && item.type !== typeFilter) return false;
      if (priorityFilter !== 'All' && item.priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const epics = filteredItems.filter(i => i.type === 'Epic');
  const storiesByEpic = filteredItems
    .filter(i => i.type === 'UserStory')
    .reduce<Record<string, WorkItem[]>>((acc, s) => {
      const key = s.parentId ?? '__unlinked__';
      acc[key] = [...(acc[key] ?? []), s];
      return acc;
    }, {});

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Planning</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-on-surface">Team Backlog</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Team <span className="text-primary italic">Backlog</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle
            value={view}
            onChange={(v) => setView(v as 'grouped' | 'table' | 'epic-board' | 'epic-graph')}
            options={[
              { value: 'grouped', label: 'Grouped', icon: <span className="material-symbols-outlined text-[14px]">account_tree</span> },
              { value: 'table', label: 'Table', icon: <span className="material-symbols-outlined text-[14px]">table_rows</span> },
              { value: 'epic-board', label: 'Board', icon: <span className="material-symbols-outlined text-[14px]">flag</span> },
              { value: 'epic-graph', label: 'Graph', icon: <span className="material-symbols-outlined text-[14px]">share</span> },
            ]}
          />
          <PrimaryActionButton
            onClick={() => { setEditingTask(null); setNewItemDefaultParentId(undefined); setNewItemDefaultType('Epic'); setIsModalOpen(true); }}
          >
            New Item
          </PrimaryActionButton>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="grid grid-cols-3 gap-4 bg-surface-container-low/70 border border-outline-variant/10 rounded-3xl px-6 py-4 shrink-0 lg:min-w-[230px]">
          <div className="text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</p>
            <p className="text-2xl font-black font-headline text-on-surface">{filteredItems.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Epics</p>
            <p className="text-2xl font-black font-headline text-purple-600">{items.filter(i => i.type === 'Epic').length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Stories</p>
            <p className="text-2xl font-black font-headline text-primary">{items.filter(i => i.type === 'UserStory').length}</p>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3 bg-surface-container-low/70 border border-outline-variant/10 rounded-3xl px-3 py-2.5 min-w-0">
          <div className="flex-1 relative min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search backlog items..."
              className="w-full h-10 pl-10 pr-4 bg-slate-200/55 border border-slate-300/50 rounded-2xl text-sm font-semibold text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <CustomFilter
            className="shrink-0"
            buttonClassName="h-10 min-w-[126px] px-4 rounded-2xl bg-slate-100 border-slate-200/80 text-slate-500"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'All', label: 'All Types' },
              { value: 'Epic', label: 'Epic' },
              { value: 'UserStory', label: 'User Story' }
            ]}
            icon={<Filter size={14} />}
          />
          <CustomFilter
            className="shrink-0"
            buttonClassName="h-10 min-w-[138px] px-4 rounded-2xl bg-slate-100 border-slate-200/80 text-slate-500"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'All', label: 'All Priorities' },
              { value: 'Urgent', label: 'Urgent' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' }
            ]}
          />
          <CustomFilter
            className="shrink-0"
            buttonClassName="h-10 min-w-[108px] px-4 rounded-2xl bg-slate-100 border-slate-200/80 text-slate-500"
            value={sortBy}
            onChange={(val) => setSortBy(val as any)}
            options={[
              { value: 'createdAt', label: 'Newest' },
              { value: 'priority', label: 'Priority' },
              { value: 'dueDate', label: 'Due Date' }
            ]}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-error/5 p-4 rounded-3xl border border-error/20"
        >
          <p className="text-sm font-bold text-error">{selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-100 transition-all"
            >
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs bg-error text-white hover:scale-95 transition-all"
            >
              <Trash2 size={14} />
              Delete Selected
            </button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {view === 'table' && (
        <div className="flex-1 overflow-y-auto pb-8">
          <BacklogTableView
            items={filteredItems}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={toggleSelectAll}
            onUpdate={fetchData}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            onViewDetails={handleViewDetails}
            users={users}
          />
        </div>
      )}
      {view === 'grouped' && (
        <div className="flex-1 overflow-y-auto pb-8 space-y-6 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-slate-50/50 border-2 border-dashed border-outline-variant/10 rounded-3xl">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">inbox</span>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">Backlog is empty</p>
              <p className="text-slate-300 text-xs font-medium">Create your first Epic or Story to get started.</p>
            </div>
          ) : (
            <>
              {epics.map(epic => (
                <EpicTreeGroup
                  key={epic.id}
                  epic={epic}
                  stories={storiesByEpic[epic.id] ?? []}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  onViewDetails={handleViewDetails}
                  onAddStory={handleAddStory}
                  users={users}
                />
              ))}
              {(storiesByEpic['__unlinked__']?.length ?? 0) > 0 && (
                <UnlinkedStoriesGroup
                  stories={storiesByEpic['__unlinked__']}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  onViewDetails={handleViewDetails}
                  users={users}
                />
              )}
            </>
          )}
        </div>
      )}
      {view === 'epic-board' && <EpicBoard hideHeader hideStats filteredBacklogItems={filteredItems} />}
      {view === 'epic-graph' && <EpicGraph hideHeader filteredBacklogItems={filteredItems} />}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); setNewItemDefaultParentId(undefined); }}
        onSave={handleCreateTask}
        defaultType={editingTask ? (editingTask.type as WorkItemType) : newItemDefaultType}
        defaultParentId={newItemDefaultParentId}
        defaultStatus="Todo"
        initialData={editingTask}
        allowedTypes={['Epic', 'UserStory']}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setViewingTask(null); }}
        task={viewingTask}
      />
    </div>
  );
}

// Tree view: Epic → Stories hierarchy
const PRIORITY_COLORS_BADGE: Record<string, string> = {
  Urgent: 'bg-error/10 text-error border-error/20',
  High: 'bg-orange-50 text-orange-600 border-orange-200',
  Medium: 'bg-primary/10 text-primary border-primary/20',
  Low: 'bg-slate-100 text-slate-500 border-slate-200',
};

function StoryTreeRow({
  story, isSelected, onToggleSelect, onDelete, onEdit, onViewDetails, users,
}: {
  story: WorkItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onViewDetails: () => void;
  users: any[];
  key?: string;
}) {
  const assignee = users.find(u => u.id === story.assigneeId);
  const taskCount = story.children?.length ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`ml-6 pl-4 border-l-2 border-primary/15 py-3 pr-4 hover:bg-surface-container-low/30 transition-all group flex items-center gap-3 ${
        isSelected ? 'bg-primary/5' : ''
      }`}
    >
      <button
        onClick={onToggleSelect}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
          isSelected ? 'bg-primary border-primary' : 'border-slate-300 hover:border-primary/50'
        }`}
      >
        {isSelected && <span className="material-symbols-outlined text-white" style={{ fontSize: '10px' }}>check</span>}
      </button>
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary shrink-0">Story</span>
      <span className="flex-1 text-sm font-medium text-on-surface truncate">{story.title}</span>
      {taskCount > 0 && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 shrink-0">{taskCount} tasks</span>
      )}
      {assignee && (
        <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1"><User size={10} />{assignee.fullName}</span>
      )}
      {story.dueDate && (
        <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1"><Calendar size={10} />{new Date(story.dueDate).toLocaleDateString()}</span>
      )}
      <TableRowActions
        onView={onViewDetails}
        onEdit={onEdit}
        onDelete={onDelete}
        size={12}
        compact
      />
    </motion.div>
  );
}

function EpicTreeGroup({
  epic, stories, selectedIds, onToggleSelect, onDelete, onEdit, onViewDetails, onAddStory, users,
}: {
  epic: WorkItem;
  stories: WorkItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: WorkItem) => void;
  onViewDetails: (item: WorkItem) => void;
  onAddStory: (epicId: string) => void;
  users: any[];
  key?: any;
}) {
  const [expanded, setExpanded] = useState(stories.length <= 5);
  const assignee = users.find(u => u.id === epic.assigneeId);

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl shadow-sm border border-white/20 overflow-hidden">
      {/* Epic header */}
      <div
        onClick={() => setExpanded(e => !e)}
        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-purple-50/40 transition-colors border-b border-outline-variant/5 group"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(epic.id); }}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
            selectedIds.has(epic.id) ? 'bg-primary border-primary' : 'border-slate-300 hover:border-primary/50'
          }`}
        >
          {selectedIds.has(epic.id) && <span className="material-symbols-outlined text-white text-sm">check</span>}
        </button>
        <span className="text-purple-500 shrink-0">{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 shrink-0">Epic</span>
        <h3 className="flex-1 text-sm font-black text-on-surface truncate">{epic.title}</h3>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 shrink-0">
          {stories.length} {stories.length === 1 ? 'story' : 'stories'}
        </span>
        {epic.priority && (
          <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase border shrink-0 ${PRIORITY_COLORS_BADGE[epic.priority] ?? PRIORITY_COLORS_BADGE['Medium']}`}>
            {epic.priority}
          </span>
        )}
        {assignee && (
          <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1"><User size={10} />{assignee.fullName}</span>
        )}
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onAddStory(epic.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus size={10} /> Story
          </button>
          <TableRowActions
            onView={() => onViewDetails(epic)}
            onEdit={() => onEdit(epic)}
            onDelete={() => onDelete(epic.id)}
            size={12}
            compact
          />
        </div>
      </div>
      {/* Stories */}
      {expanded && (
        <div className="divide-y divide-outline-variant/5 py-1">
          {stories.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No stories — click + Story to add</p>
          ) : (
            stories.map(story => (
              <StoryTreeRow
                key={story.id}
                story={story}
                isSelected={selectedIds.has(story.id)}
                onToggleSelect={() => onToggleSelect(story.id)}
                onDelete={() => onDelete(story.id)}
                onEdit={() => onEdit(story)}
                onViewDetails={() => onViewDetails(story)}
                users={users}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function UnlinkedStoriesGroup({
  stories, selectedIds, onToggleSelect, onDelete, onEdit, onViewDetails, users,
}: {
  stories: WorkItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: WorkItem) => void;
  onViewDetails: (item: WorkItem) => void;
  users: any[];
}) {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl shadow-sm border border-amber-200/40 overflow-hidden">
      <div className="p-4 flex items-center gap-3 border-b border-outline-variant/5 bg-amber-50/40">
        <span className="material-symbols-outlined text-amber-500">link_off</span>
        <h3 className="text-sm font-black text-on-surface">Unlinked Stories</h3>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">{stories.length}</span>
      </div>
      <div className="divide-y divide-outline-variant/5 py-1">
        {stories.map(story => (
          <StoryTreeRow
            key={story.id}
            story={story}
            isSelected={selectedIds.has(story.id)}
            onToggleSelect={() => onToggleSelect(story.id)}
            onDelete={() => onDelete(story.id)}
            onEdit={() => onEdit(story)}
            onViewDetails={() => onViewDetails(story)}
            users={users}
          />
        ))}
      </div>
    </div>
  );
}

// Table View
function BacklogTableView({
  items,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDelete,
  onEdit,
  onViewDetails,
  users,
}: {
  items: WorkItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  onEdit: (item: WorkItem) => void;
  onViewDetails: (item: WorkItem) => void;
  users: any[];
}) {
  const standardTable = getTableContract('standard');
  const priorityColors: Record<string, string> = {
    Urgent: 'bg-error/10 text-error',
    High: 'bg-orange-50 text-orange-600',
    Medium: 'bg-primary/10 text-primary',
    Low: 'bg-slate-100 text-slate-500',
  };

  const typeColors: Record<string, string> = {
    Epic: 'bg-purple-100 text-purple-700',
    UserStory: 'bg-primary/10 text-primary',
    TechTask: 'bg-tertiary/10 text-tertiary',
    Task: 'bg-slate-100 text-slate-600',
  };

  return (
    <TableShell variant="standard" className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm">
      <thead>
        <tr className={standardTable.headerRow}>
          <th className={`${standardTable.headerCell} w-12`}>
            <button
              onClick={onSelectAll}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedIds.size === items.length && items.length > 0
                  ? 'bg-primary border-primary'
                  : 'border-slate-300 hover:border-primary/50'
              }`}
            >
              {selectedIds.size === items.length && items.length > 0 && (
                <span className="material-symbols-outlined text-white text-sm">check</span>
              )}
            </button>
          </th>
          <th className={standardTable.headerCell}>Type</th>
          <th className={standardTable.headerCell}>Title</th>
          <th className={standardTable.headerCell}>Assignee</th>
          <th className={standardTable.headerCell}>Parent Epic</th>
          <th className={standardTable.headerCell}>Priority</th>
          <th className={standardTable.headerCell}>Due Date</th>
          <th className={standardTable.actionHeaderCell}>Actions</th>
        </tr>
      </thead>
      <tbody className={standardTable.body}>
        {items.map(item => {
          const assignee = users.find(u => u.id === item.assigneeId);
          return (
            <tr
              key={item.id}
              className={`${standardTable.row} ${selectedIds.has(item.id) ? standardTable.rowSelected : ''}`}
            >
              <td className={`${standardTable.cell} w-12`}>
                <button
                  onClick={() => onToggleSelect(item.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedIds.has(item.id)
                      ? 'bg-primary border-primary'
                      : 'border-slate-300 hover:border-primary/50'
                  }`}
                >
                  {selectedIds.has(item.id) && (
                    <span className="material-symbols-outlined text-white text-sm">check</span>
                  )}
                </button>
              </td>
              <td className={standardTable.cell}>
                <span className={`text-xs font-black uppercase px-2 py-1 rounded-full ${typeColors[item.type] || 'bg-slate-100 text-slate-600'}`}>
                  {item.type}
                </span>
              </td>
              <td className={standardTable.cell}>
                <p className="text-sm font-bold text-on-surface truncate max-w-[300px]">{item.title}</p>
              </td>
              <td className={standardTable.cell}>
                <p className="text-xs text-on-surface-variant font-medium">{assignee?.fullName || '—'}</p>
              </td>
              <td className={standardTable.cell}>
                <p className="text-xs text-slate-400 font-medium">{item.parent?.title ?? '—'}</p>
              </td>
              <td className={standardTable.cell}>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${priorityColors[item.priority] || priorityColors['Medium']}`}>
                  {item.priority}
                </span>
              </td>
              <td className={standardTable.cell}>
                <p className="text-xs text-on-surface-variant">{item.dueDate ? formatTableDate(item.dueDate) : '—'}</p>
              </td>
              <td className={standardTable.actionCell}>
                <TableRowActions
                  onView={() => onViewDetails(item)}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item.id)}
                  variant="standard"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </TableShell>
  );
}
