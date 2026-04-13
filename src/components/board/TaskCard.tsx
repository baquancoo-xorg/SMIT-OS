import { useState, ChangeEvent, MouseEvent, useEffect } from 'react';
import { WorkItem, Priority, KeyResult, Objective } from '../../types';
import { Clock, CheckCircle2, ChevronDown, ChevronUp, AlignLeft, ListTodo, CheckSquare, Square, Timer, AlertCircle, Link2, Target, MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

interface TaskCardProps {
  item: WorkItem;
  onUpdate?: (updatedItem: WorkItem) => void;
  onDelete?: (id: string) => void;
  onEdit?: (item: WorkItem) => void;
  onViewDetails?: (item: WorkItem) => void;
  key?: string | number;
}

export default function TaskCard({ item, onUpdate, onDelete, onEdit, onViewDetails }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [allObjectives, setAllObjectives] = useState<Objective[]>([]);
  const { users } = useAuth();
  const assignee = users.find(u => u.id === item.assigneeId);

  // Fetch objectives from API
  useEffect(() => {
    const fetchObjectives = async () => {
      try {
        const res = await fetch('/api/objectives');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllObjectives(data);
        }
      } catch (error) {
        console.error('Failed to fetch objectives:', error);
      }
    };
    fetchObjectives();
  }, []);

  // Find linked Key Result
  let linkedKr: KeyResult | undefined;
  if (item.linkedKrId) {
    for (const obj of allObjectives) {
      if (obj.keyResults) {
        linkedKr = obj.keyResults.find((kr: KeyResult) => kr.id === item.linkedKrId);
        if (linkedKr) break;
      }
    }
  }

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onUpdate) {
      onUpdate({ ...item, dueDate: e.target.value });
    }
  };

  const handleMarkAsDone = (e: MouseEvent) => {
    e.stopPropagation();
    if (!onUpdate) return;

    if (item.subtasks && item.subtasks.length > 0) {
      const updatedSubtasks = [...item.subtasks];
      updatedSubtasks[0] = { ...updatedSubtasks[0], completed: !updatedSubtasks[0].completed };
      onUpdate({ ...item, subtasks: updatedSubtasks });
    } else {
      const doneStatus = item.type === 'Deal' ? 'Won' : 'Done';
      onUpdate({ ...item, status: doneStatus });
    }
  };

  const toggleSubtask = (e: MouseEvent, subtaskId: string) => {
    e.stopPropagation();
    if (!onUpdate || !item.subtasks) return;

    const updatedSubtasks = item.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdate({ ...item, subtasks: updatedSubtasks });
  };

  const typeColors: Record<string, string> = {
    Epic: 'bg-purple-100 text-purple-700 border-purple-200',
    UserStory: 'bg-blue-100 text-blue-700 border-blue-200',
    TechTask: 'bg-slate-100 text-slate-700 border-slate-200',
    Campaign: 'bg-orange-100 text-orange-700 border-orange-200',
    MktTask: 'bg-amber-100 text-amber-700 border-amber-200',
    MediaTask: 'bg-pink-100 text-pink-700 border-pink-200',
    SaleTask: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Deal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    DealLost: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  const priorityColors: Record<Priority, string> = {
    Low: 'bg-slate-100 text-slate-500',
    Medium: 'bg-primary/10 text-primary',
    High: 'bg-secondary/10 text-secondary',
    Urgent: 'bg-error/10 text-error',
  };

  const completedSubtasks = item.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = item.subtasks?.length || 0;

  return (
    <motion.div
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-white/90 backdrop-blur-xl p-6 rounded-[32px] border border-outline-variant/10 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer group relative overflow-hidden ${isExpanded ? 'ring-2 ring-primary/20 border-primary/30' : ''}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          <span className={`px-4 py-1 text-[10px] font-black rounded-full uppercase tracking-[0.15em] border ${typeColors[item.type] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
            {item.type}
          </span>
          {item.priority && (
            <span className={`px-4 py-1 text-[10px] font-black rounded-full uppercase tracking-[0.15em] border ${priorityColors[item.priority]}`}>
              {item.priority}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 relative">
          <motion.button
            onClick={handleMarkAsDone}
            whileHover={{ scale: 1.1, backgroundColor: '#f0fdf4' }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-emerald-50 text-slate-300 hover:text-emerald-500 rounded-xl transition-all border border-outline-variant/10 shadow-sm"
          >
            <motion.span
              initial={false}
              animate={{
                scale: item.status === 'Done' || item.status === 'Won' ? [1, 1.2, 1] : 1,
                color: item.status === 'Done' || item.status === 'Won' ? '#10b981' : '#cbd5e1'
              }}
              className="material-symbols-outlined text-[24px]"
            >
              check_circle
            </motion.span>
          </motion.button>

          <button
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            <MoreHorizontal size={20} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onViewDetails?.(item); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
                >
                  <Eye size={16} /> View Details
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit?.(item); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
                >
                  <Edit2 size={16} /> Edit Task
                </button>
                <div className="h-px bg-slate-100"></div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-error hover:bg-error/5 transition-colors text-left"
                >
                  <Trash2 size={16} /> Delete Task
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-5">
        <motion.h4
          layout
          className={`text-2xl font-black leading-tight font-headline transition-colors duration-300 flex items-start gap-2 ${item.status === 'Done' || item.status === 'Won' ? 'text-slate-400 line-through' : 'text-on-surface group-hover:text-primary'
            }`}
        >
          {item.title}
          {linkedKr && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-1.5 flex-shrink-0"
              title={`Linked to: ${linkedKr.title}`}
            >
              <Link2 size={18} className="text-primary" />
            </motion.span>
          )}
        </motion.h4>

        {linkedKr && (
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
              <Target size={12} />
              <span>Linked Key Result</span>
            </div>
            <p className="text-xs font-bold text-on-surface line-clamp-1">{linkedKr.title}</p>
            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Progress</span>
              <span className="text-primary">{(linkedKr.currentValue || 0)}/{(linkedKr.targetValue || 100)} {linkedKr.unit || '%'}</span>
            </div>
            <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((linkedKr.currentValue || 0) / (linkedKr.targetValue || 100)) * 100}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {totalSubtasks > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <span>Progress</span>
              <span className="text-on-surface">{Math.round((completedSubtasks / totalSubtasks) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                className={`h-full transition-all duration-700 ease-out ${completedSubtasks === totalSubtasks ? 'bg-emerald-500' : 'bg-primary'
                  }`}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-outline-variant/5">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={assignee?.avatar}
                  alt={assignee?.fullName}
                  className="w-8 h-8 rounded-xl object-cover border border-outline-variant/10 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">{assignee?.fullName}</span>
            </div>

            <div className="h-4 w-px bg-slate-100"></div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-[16px]">timer</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.estimatedTime || '---'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Date'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {item.storyPoint && (
              <span className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-black border border-primary/10">
                {item.storyPoint} SP
              </span>
            )}
            <div className={`text-slate-300 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-6 space-y-6">
              {item.description && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                    {item.description}
                  </p>
                </div>
              )}

              {item.subtasks && item.subtasks.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtasks</p>
                  <div className="space-y-2">
                    {item.subtasks.map(st => (
                      <div
                        key={st.id}
                        className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-all cursor-pointer group/st"
                        onClick={(e) => toggleSubtask(e, st.id)}
                      >
                        <motion.div
                          layout
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${st.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' : 'border-slate-200 group-hover/st:border-primary'
                            }`}
                        >
                          <AnimatePresence>
                            {st.completed && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="material-symbols-outlined text-[14px]"
                              >
                                check
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        <motion.span
                          layout
                          className={`text-sm font-medium transition-all duration-300 ${st.completed ? 'text-slate-400 line-through' : 'text-on-surface'}`}
                        >
                          {st.title}
                        </motion.span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
