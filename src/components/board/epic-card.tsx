import { memo } from 'react';
import { WorkItem } from '../../types';
import { Edit2, Trash2 } from 'lucide-react';
import { PRIORITY_COLORS } from '../../utils/color-mappings';

interface EpicProgress {
  total: number;
  done: number;
  pct: number;
}

interface EpicCardProps {
  epic: WorkItem;
  progress: EpicProgress;
  storyCount: number;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  users: { id: string; fullName: string }[];
}

export default memo(function EpicCard({ epic, progress, storyCount, onSelect, onEdit, onDelete, users }: EpicCardProps) {
  const owner = users.find(u => u.id === epic.assigneeId);
  const krLinks = epic.krLinks ?? [];

  return (
    <div
      onClick={onSelect}
      className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/30 hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest bg-purple-100 text-purple-700 border border-purple-200">
            Epic
          </span>
          {epic.priority && (
            <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border ${PRIORITY_COLORS[epic.priority]}`}>
              {epic.priority}
            </span>
          )}
        </div>
        {/* Actions on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 text-slate-400 hover:text-error hover:bg-error/5 rounded-xl transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-black font-headline text-on-surface mb-1 line-clamp-2">{epic.title}</h3>

      {/* Owner */}
      {owner && (
        <p className="text-xs font-medium text-slate-500 mb-4">{owner.fullName}</p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
          <span className="text-[10px] font-black text-on-surface">{progress.pct}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              progress.pct === 100 ? 'bg-emerald-500' : 'bg-purple-500'
            }`}
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
        <span>{storyCount} {storyCount === 1 ? 'story' : 'stories'}</span>
        <span className="w-px h-3 bg-slate-200" />
        <span>{progress.total} tasks</span>
        <span className="w-px h-3 bg-slate-200" />
        <span>{progress.done} done</span>
        {epic.dueDate && (
          <>
            <span className="w-px h-3 bg-slate-200" />
            <span>Due {new Date(epic.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </>
        )}
      </div>

      {/* KR links */}
      {krLinks.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {krLinks.map((link, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              KR: {link.keyResult?.title?.slice(0, 20) ?? 'Linked'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});
