import { useState, useRef, useEffect } from 'react';
import { BarChart3, CheckCircle2, RefreshCw, ListTodo, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface WorkItemPreview {
  id: string;
  title: string;
  status: string;
  type: string;
  assignee?: { id: string; fullName: string; avatar: string };
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

interface IncompleteData {
  incompleteItems: WorkItemPreview[];
  nextSprint: { id: string; name: string } | null;
}

export default function SprintContextWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [endDialogLoading, setEndDialogLoading] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [incompleteData, setIncompleteData] = useState<IncompleteData | null>(null);
  const [completing, setCompleting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchActiveSprint = () => {
    setLoading(true);
    fetch('/api/sprints/active', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(err => console.error('Failed to fetch sprint:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchActiveSprint(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleEndSprintClick = async () => {
    if (!data?.sprint) return;
    setEndDialogLoading(true);
    try {
      const res = await fetch(`/api/sprints/${data.sprint.id}/incomplete`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      setIncompleteData(result);
      setShowEndDialog(true);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to fetch incomplete items:', err);
    } finally {
      setEndDialogLoading(false);
    }
  };

  const handleConfirmComplete = async () => {
    if (!data?.sprint) return;
    setCompleting(true);
    try {
      const response = await fetch(`/api/sprints/${data.sprint.id}/complete`, { method: 'POST', credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setShowEndDialog(false);
      setIncompleteData(null);
      fetchActiveSprint();
    } catch (err) {
      console.error('Failed to complete sprint:', err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
        <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!data?.sprint) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-slate-400 text-sm">
        <BarChart3 size={16} />
        No active sprint
      </div>
    );
  }

  const { sprint, stats, daysLeft } = data;

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center h-10 gap-2.5 px-4 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
        >
          <BarChart3 size={16} className="text-primary" />
          <span className="text-sm font-medium text-slate-700">{sprint.name}</span>
          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${stats?.progress || 0}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-500">{stats?.progress}%</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl overflow-hidden z-50"
            >
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{sprint.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d')}
                  <span className="ml-2 text-amber-600 font-medium">({daysLeft} days left)</span>
                </p>
              </div>

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
                    Active
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

              <div className="p-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => { setIsOpen(false); navigate('/sprint'); }}
                  className="w-full text-center text-sm font-medium text-primary hover:underline"
                >
                  View Sprint Board &rarr;
                </button>
                <button
                  onClick={handleEndSprintClick}
                  disabled={endDialogLoading}
                  className="w-full text-center text-sm font-medium text-error hover:underline disabled:opacity-50"
                >
                  {endDialogLoading ? 'Loading...' : 'Kết thúc Sprint'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* End Sprint Confirmation Dialog */}
      <AnimatePresence>
        {showEndDialog && incompleteData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowEndDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800">Kết thúc Sprint</h3>
                <p className="text-sm text-slate-500 mt-1">{sprint.name}</p>
              </div>

              <div className="p-5">
                {incompleteData.incompleteItems.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    Tất cả task đã hoàn thành. Xác nhận kết thúc sprint?
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-slate-600 mb-3">
                      Có{' '}
                      <span className="font-bold text-error">{incompleteData.incompleteItems.length}</span>
                      {' '}task chưa hoàn thành sẽ được chuyển sang{' '}
                      <span className="font-bold">
                        {incompleteData.nextSprint?.name ?? 'backlog chung'}
                      </span>.
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-1.5">
                      {incompleteData.incompleteItems.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-sm"
                        >
                          <span className="w-20 text-xs font-medium text-slate-400 shrink-0">{item.status}</span>
                          <span className="flex-1 text-slate-700 truncate">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  onClick={() => setShowEndDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmComplete}
                  disabled={completing}
                  className="px-4 py-2 text-sm font-bold text-white bg-error rounded-xl hover:bg-error/90 disabled:opacity-50 transition-all"
                >
                  {completing ? 'Đang xử lý...' : 'Xác nhận kết thúc'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
