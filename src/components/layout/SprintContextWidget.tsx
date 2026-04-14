import { useState, useRef, useEffect } from 'react';
import { BarChart3, CheckCircle2, RefreshCw, ListTodo, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onViewBacklog?: () => void;
}

interface SprintData {
  sprint: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  stats: {
    total: number;
    done: number;
    inProgress: number;
    todo: number;
    blocked: number;
    progress: number;
  } | null;
  daysLeft: number | null;
}

export default function SprintContextWidget({ onViewBacklog }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch active sprint
  useEffect(() => {
    fetch('/api/sprints/active')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(err => console.error('Failed to fetch sprint:', err))
      .finally(() => setLoading(false));
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-200">
        <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!data?.sprint) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-200 text-slate-400 text-sm">
        <BarChart3 size={16} />
        No active sprint
      </div>
    );
  }

  const { sprint, stats, daysLeft } = data;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-full border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all"
      >
        <BarChart3 size={16} className="text-primary" />
        <span className="text-sm font-medium text-slate-700">{sprint.name}</span>
        {/* Mini progress bar */}
        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${stats?.progress || 0}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-500">{stats?.progress}%</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">{sprint.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d')}
                <span className="ml-2 text-amber-600 font-medium">
                  ({daysLeft} days left)
                </span>
              </p>
            </div>

            {/* Progress */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Progress</span>
                <span className="text-xs font-bold text-slate-700">{stats?.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${stats?.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-tertiary" />
                  Done
                </span>
                <span className="font-bold text-slate-800">{stats?.done}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 flex items-center gap-2">
                  <RefreshCw size={14} className="text-primary" />
                  In Progress
                </span>
                <span className="font-bold text-slate-800">{stats?.inProgress}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 flex items-center gap-2">
                  <ListTodo size={14} className="text-slate-400" />
                  Todo
                </span>
                <span className="font-bold text-slate-800">{stats?.todo}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 flex items-center gap-2">
                  <Ban size={14} className="text-error" />
                  Blocked
                </span>
                <span className="font-bold text-error">{stats?.blocked}</span>
              </div>
            </div>

            {/* Action */}
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onViewBacklog?.();
                }}
                className="w-full text-center text-sm font-medium text-primary hover:underline"
              >
                View Sprint Board →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
