import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { EpicGraphNode } from '../../types';

const TEAM_COLORS: Record<string, { border: string; badge: string; bar: string }> = {
  Tech:         { border: 'border-indigo-400', badge: 'bg-indigo-100 text-indigo-700', bar: 'bg-indigo-400' },
  Marketing:    { border: 'border-amber-400',  badge: 'bg-amber-100 text-amber-700',   bar: 'bg-amber-400'  },
  Media:        { border: 'border-purple-400', badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-400' },
  Sale:         { border: 'border-emerald-400',badge: 'bg-emerald-100 text-emerald-700',bar: 'bg-emerald-400'},
  'Cross-team': { border: 'border-slate-400',  badge: 'bg-slate-100 text-slate-600',   bar: 'bg-slate-400'  },
  Unassigned:   { border: 'border-slate-300',  badge: 'bg-slate-50 text-slate-400',    bar: 'bg-slate-300'  },
};

const STATUS_COLORS: Record<string, string> = {
  Done: 'bg-emerald-100 text-emerald-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Todo: 'bg-slate-100 text-slate-500',
  Backlog: 'bg-slate-50 text-slate-400',
  Review: 'bg-amber-100 text-amber-700',
};

export default function EpicGraphNode({ data, selected }: NodeProps) {
  const epic = data as unknown as EpicGraphNode & { isLinking?: boolean };
  const colors = TEAM_COLORS[epic.primaryTeam] ?? TEAM_COLORS['Unassigned'];
  const ringCls = epic.isLinking
    ? 'ring-2 ring-orange-400'
    : selected
    ? 'ring-2 ring-blue-400'
    : '';

  return (
    <div
      className={`bg-white rounded-xl border-2 ${
        colors.border
      } ${ringCls} shadow-sm w-56 p-3 cursor-pointer transition-shadow hover:shadow-md`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-300" />

      {/* Header */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
            colors.badge
          }`}
        >
          {epic.primaryTeam}
        </span>
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            STATUS_COLORS[epic.status] ?? 'bg-slate-100 text-slate-500'
          }`}
        >
          {epic.status}
        </span>
      </div>

      <p className="text-xs font-semibold text-slate-800 leading-snug mb-2 line-clamp-2">
        {epic.title}
      </p>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-2">
        <div
          className={`h-1.5 rounded-full ${colors.bar}`}
          style={{ width: `${epic.progress}%` }}
        />
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <span>{epic.progress}%</span>
        <span className="text-slate-200">|</span>
        <span>{epic.storyCount} stories</span>
        <span className="text-slate-200">|</span>
        <span>{epic.taskCount} tasks</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-slate-300" />
    </div>
  );
}
