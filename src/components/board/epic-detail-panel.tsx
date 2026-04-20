import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkItem, WorkItemType } from '../../types';
import { X, ChevronDown, ChevronRight, Plus, Edit2 } from 'lucide-react';
import TaskModal from './TaskModal';
import TaskDetailsModal from './TaskDetailsModal';

interface EpicDetailPanelProps {
  epic: WorkItem;
  allItems: WorkItem[];
  users: { id: string; fullName: string }[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_ICON: Record<string, string> = {
  Done: '✔',
  InProgress: '●',
  Todo: '○',
};

function TaskRow({ task, users, onView }: { task: WorkItem; users: { id: string; fullName: string }[]; onView: (t: WorkItem) => void; key?: string }) {
  const assignee = users.find(u => u.id === task.assigneeId);
  const icon = STATUS_ICON[task.status] ?? '○';
  return (
    <div
      onClick={() => onView(task)}
      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl cursor-pointer group/task transition-colors"
    >
      <span className={`text-sm shrink-0 ${task.status === 'Done' ? 'text-emerald-500' : task.status === 'InProgress' ? 'text-primary' : 'text-slate-300'}`}>
        {icon}
      </span>
      <span className={`flex-1 text-sm font-medium truncate ${
        task.status === 'Done' ? 'text-slate-400 line-through' : 'text-on-surface'
      }`}>
        {task.title}
      </span>
      {assignee && (
        <span className="text-[10px] font-bold text-slate-400 shrink-0">{assignee.fullName}</span>
      )}
    </div>
  );
}

function StoryRow({
  story, tasks, users, onAddTask, onView,
}: {
  story: WorkItem;
  tasks: WorkItem[];
  users: { id: string; fullName: string }[];
  onAddTask: (parentId: string) => void;
  onView: (t: WorkItem) => void;
  key?: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const done = tasks.filter(t => t.status === 'Done').length;
  const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;

  return (
    <div className="border border-outline-variant/10 rounded-2xl overflow-hidden mb-2">
      <div
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-3 px-4 py-3 bg-slate-50/60 cursor-pointer hover:bg-slate-100/60 transition-colors"
      >
        <span className="text-slate-400 shrink-0">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="flex-1 text-sm font-bold text-on-surface truncate">{story.title}</span>
        <span className="text-[10px] font-black text-slate-400 shrink-0">{pct}%</span>
        <button
          onClick={(e) => { e.stopPropagation(); onAddTask(story.id); }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors shrink-0"
        >
          <Plus size={10} /> Task
        </button>
      </div>
      {expanded && tasks.length > 0 && (
        <div className="px-2 py-1">
          {tasks.map(t => <TaskRow key={t.id} task={t} users={users} onView={onView} />)}
        </div>
      )}
      {expanded && tasks.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-3">No tasks yet</p>
      )}
    </div>
  );
}

export default function EpicDetailPanel({ epic, allItems, users, isOpen, onClose, onUpdate }: EpicDetailPanelProps) {
  const [viewingTask, setViewingTask] = useState<WorkItem | null>(null);
  const [createModal, setCreateModal] = useState<{ open: boolean; parentId?: string; defaultType: WorkItemType }>(
    { open: false, defaultType: 'TechTask' }
  );
  const [isEditEpicOpen, setIsEditEpicOpen] = useState(false);

  const stories = allItems.filter(i => i.parentId === epic.id && i.type === 'UserStory');
  const orphanTasks = allItems.filter(i => i.parentId === epic.id && i.type !== 'UserStory');
  const getStoryTasks = (storyId: string) => allItems.filter(i => i.parentId === storyId);

  const allDescendants = [
    ...stories,
    ...orphanTasks,
    ...stories.flatMap(s => getStoryTasks(s.id)),
  ];
  const totalTasks = allDescendants.filter(i => i.type !== 'Epic' && i.type !== 'UserStory').length;
  const doneTasks = allDescendants.filter(i => i.type !== 'Epic' && i.type !== 'UserStory' && i.status === 'Done').length;
  const pct = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0;

  const owner = users.find(u => u.id === epic.assigneeId);

  const handleSaveCreate = async (item: WorkItem) => {
    try {
      await fetch('/api/work-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, id: undefined }),
      });
      setCreateModal({ open: false, defaultType: 'TechTask' });
      onUpdate();
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleSaveEpicEdit = async (updated: WorkItem) => {
    try {
      await fetch(`/api/work-items/${epic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setIsEditEpicOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update epic:', error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-[480px] bg-white z-50 shadow-2xl overflow-y-auto flex flex-col"
            >
              {/* Epic header */}
              <div className="p-6 border-b border-outline-variant/10 shrink-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-[10px] font-black rounded-full bg-purple-100 text-purple-700 uppercase tracking-widest">
                      Epic
                    </span>
                    {epic.priority && (
                      <span className="px-3 py-1 text-[10px] font-black rounded-full bg-slate-100 text-slate-600 uppercase tracking-widest">
                        {epic.priority}
                      </span>
                    )}
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-on-surface rounded-xl hover:bg-slate-100 transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <h2 className="text-xl font-black font-headline text-on-surface mb-1">{epic.title}</h2>
                {owner && <p className="text-xs font-medium text-slate-500 mb-3">{owner.fullName}</p>}
                {epic.dueDate && (
                  <p className="text-xs text-slate-400 mb-3">
                    Due {new Date(epic.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                    <span className="text-[10px] font-black text-on-surface">{pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* KR links */}
                {(epic.krLinks ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {epic.krLinks!.map((link, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                        KR: {link.keyResult?.title?.slice(0, 24) ?? 'Linked'}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditEpicOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-outline-variant/20 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 size={12} /> Edit Epic
                  </button>
                  <button
                    onClick={() => setCreateModal({ open: true, parentId: epic.id, defaultType: 'UserStory' })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Plus size={12} /> New Story
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stories section */}
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                    Stories ({stories.length})
                  </p>
                  {stories.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No stories yet</p>
                  ) : (
                    stories.map(story => (
                      <StoryRow
                        key={story.id}
                        story={story}
                        tasks={getStoryTasks(story.id)}
                        users={users}
                        onAddTask={(parentId) => setCreateModal({ open: true, parentId, defaultType: 'TechTask' })}
                        onView={setViewingTask}
                      />
                    ))
                  )}
                </div>

                {/* Orphan tasks */}
                {orphanTasks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Tasks without Story ({orphanTasks.length})
                      </p>
                      <button
                        onClick={() => setCreateModal({ open: true, parentId: epic.id, defaultType: 'TechTask' })}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Plus size={10} /> Task
                      </button>
                    </div>
                    <div className="border border-outline-variant/10 rounded-2xl overflow-hidden">
                      <div className="px-2 py-1">
                        {orphanTasks.map(t => <TaskRow key={t.id} task={t} users={users} onView={setViewingTask} />)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Show orphan task button when no orphan tasks yet */}
                {orphanTasks.length === 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tasks without Story</p>
                      <button
                        onClick={() => setCreateModal({ open: true, parentId: epic.id, defaultType: 'TechTask' })}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Plus size={10} /> Task
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 text-center py-3 border border-dashed border-outline-variant/20 rounded-2xl">No direct tasks</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create story/task modal */}
      <TaskModal
        isOpen={createModal.open}
        onClose={() => setCreateModal({ open: false, defaultType: 'TechTask' })}
        onSave={handleSaveCreate}
        defaultType={createModal.defaultType}
        initialData={createModal.parentId ? { parentId: createModal.parentId } as WorkItem : null}
      />

      {/* Edit epic modal */}
      <TaskModal
        isOpen={isEditEpicOpen}
        onClose={() => setIsEditEpicOpen(false)}
        onSave={handleSaveEpicEdit}
        defaultType="Epic"
        allowedTypes={['Epic'] as WorkItemType[]}
        initialData={epic}
      />

      {/* Task details modal */}
      <TaskDetailsModal
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
        task={viewingTask}
      />
    </>
  );
}
