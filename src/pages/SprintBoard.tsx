import { useState, useEffect } from 'react';
import TaskModal from '../components/board/TaskModal';
import TaskDetailsModal from '../components/board/TaskDetailsModal';
import CustomFilter from '../components/ui/CustomFilter';
import PrimaryActionButton from '../components/ui/PrimaryActionButton';
import { WorkItem, Sprint } from '../types';
import { Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DEPT_OPTIONS = [
  { value: 'All', label: 'All Teams' },
  { value: 'Tech', label: 'Tech & Product' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Media', label: 'Media' },
  { value: 'Sale', label: 'Sales' },
];
import TaskTableView from '../components/board/TaskTableView';

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Status' },
  { value: 'Todo', label: 'Todo' },
  { value: 'Active', label: 'Active' },
  { value: 'Review', label: 'Review' },
  { value: 'Done', label: 'Done' },
  { value: 'Void', label: 'Void' },
];

export default function SprintBoard() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkItem | null>(null);
  const [viewingTask, setViewingTask] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, users } = useAuth();

  const fetchData = async () => {
    try {
      const [itemRes, sprintRes] = await Promise.all([
        fetch('/api/work-items'),
        fetch('/api/sprints'),
      ]);
      const itemData = await itemRes.json();
      const sprintData = await sprintRes.json();

      if (Array.isArray(itemData)) setItems(itemData);
      if (Array.isArray(sprintData)) {
        setSprints(sprintData);
        if (sprintData.length > 0) {
          const today = new Date();
          const active = sprintData.find((s: Sprint) =>
            today >= new Date(s.startDate) && today <= new Date(s.endDate)
          );
          setSelectedSprintId(active?.id || sprintData[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sprint board data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const assigneeOptions = [
    { value: 'All', label: 'All Assignees' },
    ...users.map(u => ({ value: u.id, label: u.fullName }))
  ];

  const visibleItems = items.filter(i => {
    if (selectedSprintId && i.sprintId !== selectedSprintId) return false;
    if (statusFilter !== 'All' && i.status !== statusFilter) return false;
    if (deptFilter !== 'All' && !i.assignee?.departments?.includes(deptFilter)) return false;
    if (assigneeFilter !== 'All' && i.assigneeId !== assigneeFilter) return false;
    return true;
  });

  const handleUpdate = async (updated: WorkItem) => {
    const res = await fetch(`/api/work-items/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    setItems(prev => prev.map(i => i.id === data.id ? data : i));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/work-items/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleCreate = (task: WorkItem) => {
    if (editingTask) {
      handleUpdate(task);
    } else {
      fetch('/api/work-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, id: undefined, sprintId: selectedSprintId || null }),
      }).then(r => r.json()).then(data => setItems(prev => [data, ...prev]))
        .catch(err => console.error('Failed to create task:', err));
    }
    setEditingTask(null);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span>Planning</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Sprint Board</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Sprint Board
          </h2>
        </div>
        <PrimaryActionButton onClick={() => setIsModalOpen(true)}>New Task</PrimaryActionButton>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-[var(--space-md)] rounded-3xl shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
            <Filter size={14} />
            <span>Sprint:</span>
          </div>
          <CustomFilter
            value={selectedSprintId}
            onChange={setSelectedSprintId}
            options={sprints.map(s => ({ value: s.id, label: s.name }))}
          />
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Status:</div>
          <CustomFilter value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Team:</div>
          <CustomFilter value={deptFilter} onChange={setDeptFilter} options={DEPT_OPTIONS} />
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Assignee:</div>
          <CustomFilter value={assigneeFilter} onChange={setAssigneeFilter} options={assigneeOptions} />
        </div>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {visibleItems.length} items
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto pb-8">
        <TaskTableView
          items={visibleItems}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onBulkDelete={ids => setItems(prev => prev.filter(i => !ids.includes(i.id)))}
          onEdit={item => { setEditingTask(item); setIsModalOpen(true); }}
          onViewDetails={item => { setViewingTask(item); setIsDetailsOpen(true); }}
        />
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={handleCreate}
        defaultType="Task"
        defaultStatus="Todo"
        initialData={editingTask}
      />
      <TaskDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setViewingTask(null); }}
        task={viewingTask ?? null}
      />
    </div>
  );
}
