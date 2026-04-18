import { useState, ChangeEvent, MouseEvent, memo, useCallback, useMemo } from 'react';
import { WorkItem, Priority } from '../../types';
import { Clock, CheckCircle2, ChevronDown, ChevronUp, AlignLeft, ListTodo, CheckSquare, Square, Timer, AlertCircle, Link2, Target, MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { TYPE_COLORS, PRIORITY_COLORS } from '../../utils/color-mappings';

interface TaskCardProps {
  item: WorkItem;
  onUpdate?: (updatedItem: WorkItem) => void;
  onDelete?: (id: string) => void;
  onEdit?: (item: WorkItem) => void;
  onViewDetails?: (item: WorkItem) => void;
  key?: string | number;
}

export default memo(function TaskCard({ item, onUpdate, onDelete, onEdit, onViewDetails }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { users } = useAuth();
  const assignee = users.find(u => u.id === item.assigneeId);

  const linkedKr = useMemo(() => item.krLinks?.[0]?.keyResult, [item.krLinks]);

  const handleDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onUpdate?.({ ...item, dueDate: e.target.value });
  }, [item, onUpdate]);

  const handleMarkAsDone = useCallback((e: MouseEvent) => {
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
  }, [item, onUpdate]);

  const toggleSubtask = useCallback((e: MouseEvent, subtaskId: string) => {
    e.stopPropagation();
    if (!onUpdate || !item.subtasks) return;
    const updatedSubtasks = item.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdate({ ...item, subtasks: updatedSubtasks });
  }, [item, onUpdate]);

  const toggleMenu = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  }, []);

  const completedSubtasks = item.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = item.subtasks?.length || 0;

  return (
    <motion.div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-sm shadow-xl shadow-slate-200/20 transition-all duration-500 cursor-pointer group relative overflow-hidden ${isExpanded ? 'ring-2 ring-primary/20 border-primary/30' : ''}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          <span className={`px-4 py-1 text-[10px] font-black rounded-full uppercase tracking-[0.15em] border ${TYPE_COLORS[item.type] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
            {item.type}
          </span>
          {item.priority && (
            <span className={`px-4 py-1 text-[10px] font-black rounded-full uppercase tracking-[0.15em] border ${PRIORITY_COLORS[item.priority]}`}>
              {item.priority}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={toggleMenu}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Task actions menu"
            aria-expanded={isMenuOpen}
          >
            <MoreHorizontal size={20} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-12 w-48 bg-white rounded-3xl shadow-lg z-20 overflow-hidden"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onViewDetails?.(item); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
                >
                  <Eye size={16} /> View Details
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit?.(item); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
                >
                  <Edit2 size={16} /> Edit Task
                </button>
                <div className="h-px bg-slate-100"></div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-sm font-bold text-error hover:bg-error/5 transition-colors text-left"
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
          className={`text-base font-black leading-tight font-headline transition-colors duration-300 flex items-start gap-2 ${item.status === 'Done' || item.status === 'Won' ? 'text-slate-400 line-through' : 'text-on-surface'}`}
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
            <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">{assignee?.fullName}</span>

            <div className="h-4 w-px bg-slate-100"></div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-[16px]">timer</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.estimatedTime || '---'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '---'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                  <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-4 rounded-3xl shadow-sm">
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
                        className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl shadow-sm hover:border-primary/20 transition-all cursor-pointer group/st"
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
});
