import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow, isSameDay } from 'date-fns';
import { useNotifications } from '../../hooks/use-notifications';
import { WorkItem } from '../../types';

interface Props {
  workItems: WorkItem[];
}

export default function NotificationCenter({ workItems }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deadlineItems, dismissDeadline } = useNotifications(workItems);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'report_approved': return '✓';
      case 'deadline_warning': return '⚠';
      case 'sprint_ending': return '🏃';
      case 'okr_risk': return '📊';
      default: return '🔔';
    }
  };

  const totalUnread = unreadCount + deadlineItems.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:shadow-md transition-all"
      >
        <Bell size={20} className="text-slate-600" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] leading-none font-bold rounded-full flex items-center justify-center shadow-sm">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && deadlineItems.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">No notifications</p>
                </div>
              ) : (
                <>
                  {deadlineItems.length > 0 && (
                    <div className="border-b border-slate-100">
                      <div className="p-3 bg-amber-50/50">
                        <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Deadlines</p>
                      </div>
                      {deadlineItems.map(item => {
                        const due = new Date(item.dueDate!);
                        const dueLabel = isSameDay(due, new Date()) ? 'Due today' : format(due, 'MMM d');

                        return (
                          <div
                            key={item.id}
                            onClick={() => dismissDeadline(item.id)}
                            className="px-4 py-3 border-t border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <Calendar size={16} className="text-amber-600 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                                <p className="text-xs text-slate-500 mt-1">{dueLabel}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissDeadline(item.id);
                                }}
                                className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
                                aria-label="Dismiss deadline"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {notifications.length > 0 && (
                    <div>
                      <div className="p-3 bg-slate-50/70">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">System</p>
                      </div>
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => !n.isRead && markAsRead(n.id)}
                          className={`p-4 border-t border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                            !n.isRead ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <span className="text-lg">{getIcon(n.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            {!n.isRead && (
                              <span className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
