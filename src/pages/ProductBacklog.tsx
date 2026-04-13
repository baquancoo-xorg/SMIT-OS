import { useState, useEffect } from 'react';
import { WorkItem, WorkItemType, Priority } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutGrid, List, Plus, Search, Filter, Trash2, Edit2, Eye,
  ChevronDown, Inbox, ArrowUpRight, Flag, Calendar, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TaskModal from '../components/board/TaskModal';
import TaskDetailsModal from '../components/board/TaskDetailsModal';

export default function ProductBacklog() {
  const [view, setView] = useState<'board' | 'table'>('board');
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkItem | null>(null);
  const [viewingTask, setViewingTask] = useState<WorkItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'dueDate'>('createdAt');
  const { currentUser, users } = useAuth();

  const fetchData = async () => {
    try {
      const res = await fetch('/api/work-items');
      if (res.ok) {
        const data: WorkItem[] = await res.json();
        const backlogItems = data.filter((item: WorkItem) =>
          !item.sprintId && (item.assignee?.department === 'Tech' || ['Epic', 'UserStory', 'TechTask'].includes(item.type))
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
        const data = await res.json();
        setItems(prev => prev.map(item => item.id === data.id ? data : item));
      } else {
        const res = await fetch('/api/work-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newTask,
            id: undefined,
            assigneeId: currentUser?.id,
            sprintId: null
          })
        });
        const data = await res.json();
        setItems(prev => [data, ...prev]);
      }
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save task:', error);
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

  const groupedByType = filteredItems.reduce<Record<string, WorkItem[]>>((acc, item) => {
    const type = item.type as string;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
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
    <div className="h-full flex flex-col p-6 lg:p-10 space-y-6 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-1 text-on-surface-variant font-medium text-xs">
            <span className="hover:text-primary cursor-pointer">Tech&Product</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-on-surface">Product Backlog</span>
          </nav>
          <h2 className="text-3xl font-black font-headline tracking-tight text-on-surface flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Inbox size={20} />
            </span>
            Product Backlog
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-surface-container-high rounded-full border border-outline-variant/10">
            <button
              onClick={() => setView('board')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'board' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}
            >
              <LayoutGrid size={12} />
              Grouped
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'table' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}
            >
              <List size={12} />
              Table
            </button>
          </div>
          <button
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-lg shadow-primary/20 hover:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Item
          </button>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Stats */}
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-outline-variant/10 shadow-sm">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
            <p className="text-2xl font-black font-headline text-on-surface">{filteredItems.length}</p>
          </div>
          <div className="w-px h-10 bg-outline-variant/10"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Epics</p>
            <p className="text-2xl font-black font-headline text-purple-600">{items.filter(i => i.type === 'Epic').length}</p>
          </div>
          <div className="w-px h-10 bg-outline-variant/10"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stories</p>
            <p className="text-2xl font-black font-headline text-primary">{items.filter(i => i.type === 'UserStory').length}</p>
          </div>
          <div className="w-px h-10 bg-outline-variant/10"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks</p>
            <p className="text-2xl font-black font-headline text-tertiary">{items.filter(i => i.type === 'TechTask' || i.type === 'Task').length}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex-1 flex items-center gap-3 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-outline-variant/10 shadow-sm">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search backlog items..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2 pr-8 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Epic">Epic</option>
              <option value="UserStory">User Story</option>
              <option value="TechTask">Tech Task</option>
              <option value="Task">Task</option>
            </select>
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="appearance-none bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2 pr-8 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2 pr-8 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="createdAt">Newest</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>
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
      {view === 'table' ? (
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
      ) : (
        <div className="flex-1 overflow-y-auto pb-8 space-y-6 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-slate-50/50 border-2 border-dashed border-outline-variant/10 rounded-[40px]">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">inbox</span>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">Backlog is empty</p>
              <p className="text-slate-300 text-xs font-medium">Create your first Epic, Story, or Task to get started.</p>
            </div>
          ) : (
            Object.entries(groupedByType).map(([type, typeItems]) => (
              <BacklogGroupCard
                key={type}
                type={type as WorkItemType}
                items={typeItems as WorkItem[]}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
                onViewDetails={handleViewDetails}
                users={users}
              />
            ))
          )}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={handleCreateTask}
        defaultType="TechTask"
        defaultStatus="To Do"
        initialData={editingTask}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setViewingTask(null); }}
        task={viewingTask}
      />
    </div>
  );
}

// Board view: Group by type
function BacklogGroupCard({
  type,
  items,
  selectedIds,
  onToggleSelect,
  onDelete,
  onEdit,
  onViewDetails,
  users,
  key: _key,
}: {
  type: WorkItemType;
  items: WorkItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: WorkItem) => void;
  onViewDetails: (item: WorkItem) => void;
  users: any[];
  key?: string | number;
}) {
  const typeConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
    Epic: { label: 'Epic', color: 'text-purple-700', bgColor: 'bg-purple-50', icon: 'flag' },
    UserStory: { label: 'User Story', color: 'text-primary', bgColor: 'bg-primary/5', icon: 'person' },
    TechTask: { label: 'Tech Task', color: 'text-tertiary', bgColor: 'bg-tertiary/5', icon: 'code' },
    Task: { label: 'Task', color: 'text-slate-700', bgColor: 'bg-slate-50', icon: 'task_alt' },
  };

  const config = typeConfig[type] || { label: type, color: 'text-slate-700', bgColor: 'bg-slate-50', icon: 'task' };

  return (
    <div className="bg-white rounded-[32px] border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-outline-variant/5">
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined text-2xl ${config.color}`}>{config.icon}</span>
          <h3 className="text-lg font-black font-headline text-on-surface">{config.label}</h3>
          <span className="px-3 py-1 rounded-full bg-surface-container-high text-[10px] font-black text-slate-500">
            {items.length}
          </span>
        </div>
      </div>
      <div className="divide-y divide-outline-variant/5">
        {items.map(item => (
          <BacklogItemRow
            key={item.id}
            item={item}
            isSelected={selectedIds.has(item.id)}
            onToggleSelect={() => onToggleSelect(item.id)}
            onDelete={() => onDelete(item.id)}
            onEdit={() => onEdit(item)}
            onViewDetails={() => onViewDetails(item)}
            users={users}
          />
        ))}
      </div>
    </div>
  );
}

function BacklogItemRow({
  item,
  isSelected,
  onToggleSelect,
  onDelete,
  onEdit,
  onViewDetails,
  users,
  key: _key,
}: {
  item: WorkItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onViewDetails: () => void;
  users: any[];
  key?: string | number;
}) {
  const priorityColors: Record<string, string> = {
    Urgent: 'bg-error/10 text-error border-error/20',
    High: 'bg-orange-50 text-orange-600 border-orange-200',
    Medium: 'bg-primary/10 text-primary border-primary/20',
    Low: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const typeColors: Record<string, string> = {
    Epic: 'bg-purple-100 text-purple-700',
    UserStory: 'bg-primary/10 text-primary',
    TechTask: 'bg-tertiary/10 text-tertiary',
    Task: 'bg-slate-100 text-slate-600',
  };

  const assignee = users.find(u => u.id === item.assigneeId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-4 flex items-center gap-4 hover:bg-surface-container-low/30 transition-all group ${isSelected ? 'bg-primary/5' : ''}`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary/20 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${typeColors[item.type] || 'bg-slate-100 text-slate-600'}`}>
            {item.type}
          </span>
          {item.storyPoints && (
            <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
              {item.storyPoints} SP
            </span>
          )}
          <h4 className="text-sm font-bold text-on-surface truncate">{item.title}</h4>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium">
          {assignee && (
            <span className="flex items-center gap-1">
              <User size={10} />
              {assignee.fullName}
            </span>
          )}
          {item.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {new Date(item.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${priorityColors[item.priority] || priorityColors['Medium']}`}>
        {item.priority}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={onViewDetails}
          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
          title="View Details"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-slate-400 hover:text-error hover:bg-error/5 rounded-lg transition-all"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
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
    <div className="bg-white rounded-[32px] border border-outline-variant/10 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-outline-variant/10 bg-surface-container-low/30">
            <th className="p-4 w-12">
              <input
                type="checkbox"
                checked={selectedIds.size === items.length && items.length > 0}
                onChange={onSelectAll}
                className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary/20 cursor-pointer"
              />
            </th>
            <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
            <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
            <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
            <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
            <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Story Points</th>
            <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
            <th className="p-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/5">
          {items.map(item => {
            const assignee = users.find(u => u.id === item.assigneeId);
            return (
              <tr
                key={item.id}
                className={`hover:bg-surface-container-low/30 transition-all ${selectedIds.has(item.id) ? 'bg-primary/5' : ''}`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary/20 cursor-pointer"
                  />
                </td>
                <td className="p-4">
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${typeColors[item.type] || 'bg-slate-100 text-slate-600'}`}>
                    {item.type}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-sm font-bold text-on-surface truncate max-w-[300px]">{item.title}</p>
                </td>
                <td className="p-4">
                  <p className="text-xs text-on-surface-variant font-medium">{assignee?.fullName || '—'}</p>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${priorityColors[item.priority] || priorityColors['Medium']}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-xs font-bold text-on-surface">{item.storyPoints || '—'}</p>
                </td>
                <td className="p-4">
                  <p className="text-xs text-on-surface-variant">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}</p>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetails(item)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-error hover:bg-error/5 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
