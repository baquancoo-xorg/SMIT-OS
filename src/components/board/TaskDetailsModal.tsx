import React from 'react';
import { WorkItem } from '../../types';
import { X, Calendar, Clock, Target, User as UserIcon, AlignLeft, CheckSquare, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { TYPE_COLORS, PRIORITY_COLORS, STATUS_COLORS } from '../../utils/color-mappings';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: WorkItem | null;
}

export default function TaskDetailsModal({ isOpen, onClose, task }: TaskDetailsModalProps) {
  const { users } = useAuth();

  if (!isOpen || !task) return null;

  const assignee = users.find(u => u.id === task.assigneeId);

  const linkedKr = task.krLinks?.[0]?.keyResult;
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl lg:max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-[0.15em] border ${TYPE_COLORS[task.type] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                {task.type}
              </span>
              {task.priority && (
                <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-[0.15em] border ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto flex-1 space-y-8">
            <div>
              <h2 className="text-3xl font-black font-headline text-slate-800 mb-4">{task.title}</h2>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <UserIcon size={16} />
                  <span>{assignee?.fullName || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}</span>
                </div>
                {task.estimatedTime && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{task.estimatedTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[task.status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            </div>

            {linkedKr && (
              <div className="bg-primary/5 rounded-3xl p-5 border border-primary/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
                  <Target size={16} />
                  <span>Linked Key Result</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{linkedKr.title}</p>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Progress</span>
                  <span className="text-primary">{(linkedKr.currentValue || 0)} / {(linkedKr.targetValue || 100)} {linkedKr.unit || '%'}</span>
                </div>
                <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${((linkedKr.currentValue || 0) / (linkedKr.targetValue || 100)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {task.description && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <AlignLeft size={16} />
                  <span>Description</span>
                </div>
                <div className="bg-slate-50 rounded-3xl p-5 text-sm text-slate-600 leading-relaxed shadow-sm">
                  {task.description}
                </div>
              </div>
            )}

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <CheckSquare size={16} />
                    <span>Subtasks</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{completedSubtasks} / {totalSubtasks} completed</span>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${completedSubtasks === totalSubtasks ? 'bg-emerald-500' : 'bg-primary'}`}
                    style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                  />
                </div>

                <div className="space-y-2 mt-4">
                  {task.subtasks.map(st => (
                    <div key={st.id} className="flex items-center gap-3 p-4 bg-white shadow-sm rounded-xl">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${st.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                        }`}>
                        {st.completed && <CheckSquare size={12} />}
                      </div>
                      <span className={`text-sm font-medium ${st.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
