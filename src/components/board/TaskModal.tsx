import { useState, useEffect } from 'react';
import { WorkItem, WorkItemType, Priority } from '../../types';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: WorkItem) => void;
  defaultType?: WorkItemType;
  defaultStatus?: string;
  initialData?: WorkItem | null;
  allowedTypes?: WorkItemType[];
}

const ALL_TYPES: WorkItemType[] = ['Epic', 'UserStory', 'TechTask', 'Campaign', 'MktTask', 'MediaTask', 'SaleTask', 'Deal'];

const TYPE_LABELS: Record<WorkItemType, string> = {
  Epic: 'Epic',
  UserStory: 'User Story',
  TechTask: 'Tech Task',
  Campaign: 'Campaign',
  MktTask: 'Marketing Task',
  MediaTask: 'Media Task',
  SaleTask: 'Sale Task',
  Deal: 'Deal',
  Task: 'Task',
};

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  defaultType = 'TechTask',
  defaultStatus = 'Todo',
  initialData,
  allowedTypes,
}: TaskModalProps) {
  const { users } = useAuth();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<WorkItemType>(initialData?.type as WorkItemType || defaultType);
  const [priority, setPriority] = useState<Priority>(initialData?.priority as Priority || 'Medium');
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId || (users.length > 0 ? users[0].id : ''));
  const [status, setStatus] = useState(initialData?.status || defaultStatus);
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [storyPoints, setStoryPoints] = useState<number | undefined>(initialData?.storyPoints);

  // Parent selection state (edit mode only)
  const [parentId, setParentId] = useState<string | undefined>(initialData?.parentId);
  const [availableParents, setAvailableParents] = useState<WorkItem[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);

  const typeOptions = allowedTypes || ALL_TYPES;

  // Fetch available parents (Epic/UserStory) for edit mode
  useEffect(() => {
    if (!isOpen || !initialData) return;

    const fetchParents = async () => {
      setLoadingParents(true);
      try {
        const res = await fetch('/api/work-items');
        if (res.ok) {
          const items: WorkItem[] = await res.json();
          const parents = items.filter(
            item => ['Epic', 'UserStory'].includes(item.type) && item.id !== initialData?.id
          );
          setAvailableParents(parents);
        }
      } catch (error) {
        console.error('Failed to fetch parents:', error);
      } finally {
        setLoadingParents(false);
      }
    };

    fetchParents();
  }, [isOpen, initialData]);

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setType(initialData.type as WorkItemType);
      setPriority(initialData.priority as Priority || 'Medium');
      setAssigneeId(initialData.assigneeId || (users.length > 0 ? users[0].id : ''));
      setStatus(initialData.status);
      setDueDate(initialData.dueDate || '');
      setStartDate(initialData.startDate || '');
      setStoryPoints(initialData.storyPoints);
      setParentId(initialData.parentId);
    } else {
      setTitle('');
      setDescription('');
      setType(defaultType);
      setPriority('Medium');
      setAssigneeId(users.length > 0 ? users[0].id : '');
      setStatus(defaultStatus);
      setDueDate('');
      setStartDate('');
      setStoryPoints(undefined);
      setParentId(undefined);
    }
  }, [initialData, defaultType, defaultStatus, isOpen, users]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;

    const newTask: WorkItem = {
      ...initialData,
      id: initialData?.id || `task-${Date.now()}`,
      title,
      description,
      type,
      priority,
      assigneeId,
      status,
      dueDate: dueDate || undefined,
      startDate: startDate || undefined,
      storyPoints,
      parentId: parentId || undefined,
    } as WorkItem;

    onSave(newTask);
    onClose();
  };

  const showStoryPoints = type === 'Epic' || type === 'UserStory' || type === 'TechTask';
  const showParentSelect = initialData && type !== 'Epic';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black font-headline text-on-surface">{initialData ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-outline-variant/20 bg-white text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Enter task title..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
              placeholder="Enter task description..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as WorkItemType)}
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-on-surface"
              >
                {typeOptions.map(t => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-on-surface"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-on-surface"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-on-surface"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-on-surface"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-on-surface"
              />
            </div>

            {showStoryPoints && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Story Points</label>
                <input
                  type="number"
                  value={storyPoints || ''}
                  onChange={(e) => setStoryPoints(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-on-surface"
                  placeholder="e.g., 5"
                />
              </div>
            )}

            {showParentSelect && (
              <div className={showStoryPoints ? '' : 'col-span-2'}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Link to Parent <span className="text-slate-300 normal-case tracking-normal">(Optional)</span>
                </label>
                {loadingParents ? (
                  <div className="px-4 py-3 rounded-2xl border border-outline-variant/20 bg-slate-50 text-slate-400 text-sm">
                    Loading parents...
                  </div>
                ) : (
                  <select
                    value={parentId || ''}
                    onChange={(e) => setParentId(e.target.value || undefined)}
                    className="w-full px-4 py-3 rounded-2xl border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-on-surface"
                  >
                    <option value="">No Parent</option>
                    {availableParents.map(p => (
                      <option key={p.id} value={p.id}>
                        [{TYPE_LABELS[p.type as WorkItemType] || p.type}] {p.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-6 py-3 rounded-full font-bold text-sm bg-primary text-white shadow-lg shadow-primary/20 hover:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {initialData ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
