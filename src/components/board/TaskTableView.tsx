import React, { useState, useEffect } from 'react';
import { WorkItem, Priority } from '../../types';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  User as UserIcon,
  Calendar,
  Trash2,
  Edit2,
  Eye,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

interface TaskTableViewProps {
  items: WorkItem[];
  onUpdate?: (updatedItem: WorkItem) => void;
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onEdit?: (item: WorkItem) => void;
  onViewDetails?: (item: WorkItem) => void;
}

export default function TaskTableView({ items, onUpdate, onDelete, onBulkDelete, onEdit, onViewDetails }: TaskTableViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'auto' | 'table' | 'card'>('auto');
  const [isMobile, setIsMobile] = useState(false);
  const { users } = useAuth();

  // C10: Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const effectiveView = viewMode === 'auto' ? (isMobile ? 'card' : 'table') : viewMode;
  const priorityColors: Record<Priority, string> = {
    Low: 'bg-blue-50 text-blue-600',
    Medium: 'bg-amber-50 text-amber-600',
    High: 'bg-orange-50 text-orange-600',
    Urgent: 'bg-rose-50 text-rose-600',
  };

  const statusColors: Record<string, string> = {
    'Todo': 'bg-slate-100 text-slate-600',
    'In Progress': 'bg-blue-100 text-blue-600',
    'Doing': 'bg-blue-100 text-blue-600',
    'Code Review': 'bg-purple-100 text-purple-600',
    'Review': 'bg-purple-100 text-purple-600',
    'Done': 'bg-emerald-100 text-emerald-600',
    'Won': 'bg-emerald-100 text-emerald-600',
    'Lost': 'bg-rose-100 text-rose-600',
    'Idea': 'bg-indigo-100 text-indigo-600',
    'MQL': 'bg-blue-50 text-blue-600',
    'SQL': 'bg-indigo-50 text-indigo-600',
    'Demo': 'bg-purple-50 text-purple-600',
    'Negotiation': 'bg-amber-50 text-amber-600',
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(items.map(i => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  // C10: Mobile Card View Component
  const MobileCardView = () => (
    <div className="space-y-3">
      {items.map(item => {
        const assignee = users.find(u => u.id === item.assigneeId);
        const totalSubtasks = item.subtasks?.length || 0;
        const completedSubtasks = item.subtasks?.filter(st => st.completed).length || 0;
        const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

        return (
          <div
            key={item.id}
            onClick={() => onViewDetails?.(item)}
            className="bg-white p-4 rounded-2xl border border-outline-variant/10 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h4 className="text-sm font-bold text-on-surface line-clamp-2">{item.title}</h4>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full flex-shrink-0 ${
                item.priority === 'Urgent' ? 'bg-error/10 text-error' :
                item.priority === 'High' ? 'bg-orange-50 text-orange-600' :
                item.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                'bg-slate-100 text-slate-500'
              }`}>
                {item.priority}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-3">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">person</span>
                {assignee?.fullName || 'Unassigned'}
              </span>
              <span className={`font-bold ${
                item.status === 'Done' || item.status === 'Won' ? 'text-emerald-600' :
                item.status === 'In Progress' || item.status === 'Doing' ? 'text-primary' :
                'text-slate-400'
              }`}>
                {item.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{progress}%</span>
            </div>

            {item.dueDate && (
              <div className="mt-2 text-[10px] text-error flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                {new Date(item.dueDate).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        );
      })}
      {items.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-outline-variant/10">
          <CheckCircle2 size={32} className="text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-900">No tasks found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* C10: View toggle for mobile */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={() => setViewMode('card')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold min-h-[44px] transition-all ${
            effectiveView === 'card' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <LayoutGrid size={14} />
          Cards
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold min-h-[44px] transition-all ${
            effectiveView === 'table' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <List size={14} />
          Table
        </button>
      </div>

      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between bg-error/5 p-4 rounded-3xl border border-error/20"
          >
            <p className="text-sm font-bold text-error">{selectedIds.size} task{selectedIds.size > 1 ? 's' : ''} selected</p>
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
      </AnimatePresence>

      {/* C10: Conditional rendering - Card or Table view */}
      {effectiveView === 'card' ? (
        <MobileCardView />
      ) : (
      <div className="bg-white rounded-[32px] border border-outline-variant/10 shadow-xl shadow-slate-200/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-outline-variant/10">
              <th className="px-8 py-6 w-12">
                <button
                  onClick={() => handleSelectAll({ target: { checked: !(selectedIds.size === items.length && items.length > 0) } } as any)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedIds.size === items.length && items.length > 0
                      ? 'bg-primary border-primary'
                      : 'border-slate-300 hover:border-primary/50'
                  }`}
                >
                  {selectedIds.size === items.length && items.length > 0 && (
                    <span className="material-symbols-outlined text-white text-[14px]">check</span>
                  )}
                </button>
              </th>
              <th className="px-4 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Task Details</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assignee</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Priority</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deadline</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Completion</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {items.map(item => {
              const assignee = users.find(u => u.id === item.assigneeId);
              const totalSubtasks = item.subtasks?.length || 0;
              const completedSubtasks = item.subtasks?.filter(st => st.completed).length || 0;
              const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
              const isSelected = selectedIds.has(item.id);

              return (
                <tr key={item.id} className={`hover:bg-primary/[0.02] transition-colors group ${isSelected ? 'bg-primary/[0.02]' : ''}`}>
                  <td className="px-8 py-5">
                    <button
                      onClick={() => handleSelectOne(item.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-slate-300 hover:border-primary/50'
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-white text-[14px]">check</span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col">
                      <span 
                        className="text-sm font-black text-on-surface group-hover:text-primary transition-colors cursor-pointer"
                        onClick={() => onViewDetails?.(item)}
                      >
                        {item.title}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-on-surface-variant">{assignee?.fullName || 'Unassigned'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      item.status === 'Done' || item.status === 'Won' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      item.status === 'In Progress' || item.status === 'Doing' ? 'bg-primary/5 text-primary border-primary/10' :
                      'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {item.priority && (
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${
                        item.priority === 'Urgent' ? 'bg-error/5 text-error border-error/10' :
                        item.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {item.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">event</span>
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString('vi-VN') : '-'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[100px] relative">
                        <div 
                          className={`h-full transition-all duration-700 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-on-surface-variant w-8">{progress}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>
                    <AnimatePresence>
                      {openMenuId === item.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-8 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden"
                        >
                          <button 
                            onClick={() => { onViewDetails?.(item); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
                          >
                            <Eye size={16} /> View Details
                          </button>
                          <button 
                            onClick={() => { onEdit?.(item); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
                          >
                            <Edit2 size={16} /> Edit Task
                          </button>
                          <div className="h-px bg-slate-100"></div>
                          <button 
                            onClick={() => { onDelete?.(item.id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-error hover:bg-error/5 transition-colors text-left"
                          >
                            <Trash2 size={16} /> Delete Task
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No tasks found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or add a new task.</p>
        </div>
      )}
      </div>
      )}
    </div>
  );
}
