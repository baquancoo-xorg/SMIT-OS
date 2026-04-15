import React from 'react';
import { CheckCircle2, Activity } from 'lucide-react';
import { WorkItem } from '../../../types';

export interface TaskStatusCardProps {
  task: WorkItem;
  status: 'done' | 'doing' | null;
  onStatusChange: (status: 'done' | 'doing') => void;
  teamColor: string;
  children?: React.ReactNode;
}

export default function TaskStatusCard({
  task,
  status,
  onStatusChange,
  teamColor,
  children,
}: TaskStatusCardProps) {
  const isDone = status === 'done';
  const isDoing = status === 'doing';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded uppercase shrink-0">
            {task.id.slice(0, 8)}
          </span>
          <span className="text-sm font-bold text-slate-800 truncate">{task.title}</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onStatusChange('done')}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              isDone
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 size={14} className="mr-1" /> Đã Xong
          </button>
          <button
            onClick={() => onStatusChange('doing')}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              isDoing
                ? `bg-blue-50 border-blue-500 text-blue-700`
                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Activity size={14} className="mr-1" /> Đang Làm
          </button>
        </div>
      </div>

      {/* Expandable content for team-specific metrics */}
      {(isDone || isDoing) && children && (
        <div className="border-t border-slate-100 p-4 bg-white animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
