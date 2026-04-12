import React from 'react';
import { WorkItem, Priority } from '../../types';
import { users } from '../../data/mockData';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MoreHorizontal,
  User as UserIcon,
  Calendar
} from 'lucide-react';

interface TaskTableViewProps {
  items: WorkItem[];
  onUpdate?: (updatedItem: WorkItem) => void;
}

export default function TaskTableView({ items, onUpdate }: TaskTableViewProps) {
  const priorityColors: Record<Priority, string> = {
    Low: 'bg-blue-50 text-blue-600',
    Medium: 'bg-amber-50 text-amber-600',
    High: 'bg-orange-50 text-orange-600',
    Urgent: 'bg-rose-50 text-rose-600',
  };

  const statusColors: Record<string, string> = {
    'To Do': 'bg-slate-100 text-slate-600',
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

  return (
    <div className="bg-white rounded-[32px] border border-outline-variant/10 shadow-xl shadow-slate-200/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-outline-variant/10">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Task Details</th>
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

              return (
                <tr key={item.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-on-surface group-hover:text-primary transition-colors">{item.title}</span>
                      <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {assignee?.avatar ? (
                          <img 
                            src={assignee.avatar} 
                            alt={assignee.fullName} 
                            className="w-8 h-8 rounded-xl object-cover border border-outline-variant/20 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                            {assignee?.fullName.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">{assignee?.fullName}</span>
                    </div>
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
                  <td className="px-8 py-5 text-right">
                    <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>
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
  );
}
