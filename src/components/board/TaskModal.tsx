import { useState, useEffect } from 'react';
import { WorkItem, WorkItemType, Priority } from '../../types';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CustomSelect from '../ui/CustomSelect';
import CustomDatePicker from '../ui/CustomDatePicker';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: WorkItem) => void;
  defaultType?: WorkItemType;
  defaultStatus?: string;
  defaultParentId?: string;
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
  defaultParentId,
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

  // Parent selection state (edit mode only)
  const [parentId, setParentId] = useState<string | undefined>(initialData?.parentId);
  const [availableParents, setAvailableParents] = useState<WorkItem[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const typeOptions = allowedTypes || ALL_TYPES;

  // Fetch available parents (Epic/UserStory) for both create and edit mode
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, initialData?.id]);

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
      setParentId(initialData.parentId);
    } else {
      setTitle('');
      setDescription('');
      setType(defaultType);
      setPriority('Medium');
      setAssigneeId('');
      setStatus(defaultStatus);
      setDueDate('');
      setStartDate('');
      setParentId(defaultParentId);
    }
    setErrors({});
  }, [initialData, defaultType, defaultStatus, defaultParentId, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Bắt buộc';
    if (!assigneeId) newErrors.assigneeId = 'Bắt buộc';
    if (!startDate) newErrors.startDate = 'Bắt buộc';
    if (!dueDate) newErrors.dueDate = 'Bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

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
      parentId: parentId || undefined,
    } as WorkItem;

    onSave(newTask);
    onClose();
  };

  const showParentSelect = type !== 'Epic';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black font-headline text-on-surface">{initialData ? 'Edit' : 'Create New'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Title <span className="text-red-500">*</span>
              {errors.title && <span className="ml-2 text-red-500 normal-case tracking-normal font-medium">{errors.title}</span>}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: '' })); }}
              className={`w-full px-4 py-3 rounded-3xl border bg-white text-on-surface focus:ring-2 outline-none transition-all ${
                errors.title ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-outline-variant/20 focus:border-primary focus:ring-primary/20'
              }`}
              placeholder="Enter title..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-3xl border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
              placeholder="Enter description..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
              <CustomSelect
                value={type}
                onChange={(val) => setType(val as WorkItemType)}
                options={typeOptions.map(t => ({ value: t, label: TYPE_LABELS[t] }))}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority</label>
              <CustomSelect
                value={priority}
                onChange={(val) => setPriority(val as Priority)}
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' },
                  { value: 'Urgent', label: 'Urgent' }
                ]}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Assignee <span className="text-red-500">*</span>
                {errors.assigneeId && <span className="ml-2 text-red-500 normal-case tracking-normal font-medium">{errors.assigneeId}</span>}
              </label>
              <CustomSelect
                value={assigneeId}
                onChange={(val) => { setAssigneeId(val); setErrors(prev => ({ ...prev, assigneeId: '' })); }}
                options={[{ value: '', label: 'Chọn assignee...' }, ...users.map(user => ({ value: user.id, label: user.fullName }))]}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
              <CustomSelect
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'Todo', label: 'Todo' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Review', label: 'Review' },
                  { value: 'Done', label: 'Done' },
                  { value: 'Void', label: 'Void' }
                ]}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Start Date <span className="text-red-500">*</span>
                {errors.startDate && <span className="ml-2 text-red-500 normal-case tracking-normal font-medium">{errors.startDate}</span>}
              </label>
              <CustomDatePicker
                value={startDate}
                onChange={(val) => { setStartDate(val); setErrors(prev => ({ ...prev, startDate: '' })); }}
                placeholder="Select start date..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Due Date <span className="text-red-500">*</span>
                {errors.dueDate && <span className="ml-2 text-red-500 normal-case tracking-normal font-medium">{errors.dueDate}</span>}
              </label>
              <CustomDatePicker
                value={dueDate}
                onChange={(val) => { setDueDate(val); setErrors(prev => ({ ...prev, dueDate: '' })); }}
                placeholder="Select due date..."
              />
            </div>

            {showParentSelect && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Link to Parent <span className="text-slate-300 normal-case tracking-normal">(Optional)</span>
                </label>
                {loadingParents ? (
                  <div className="px-4 py-3 rounded-3xl border border-outline-variant/20 bg-slate-50 text-slate-400 text-sm">
                    Loading parents...
                  </div>
                ) : (
                  <CustomSelect
                    value={parentId || ''}
                    onChange={(val) => setParentId(val || undefined)}
                    options={[
                      { value: '', label: 'No Parent' },
                      ...availableParents.map(p => ({
                        value: p.id,
                        label: `[${TYPE_LABELS[p.type as WorkItemType] || p.type}] ${p.title}`
                      }))
                    ]}
                  />
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
            className="px-6 py-3 rounded-full font-bold text-sm bg-primary text-white shadow-lg shadow-primary/20 hover:scale-95 transition-all"
          >
            {initialData ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
