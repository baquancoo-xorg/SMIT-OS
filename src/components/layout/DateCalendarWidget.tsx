import { useState, useRef, useEffect } from 'react';
import { Calendar, Pin, AlertTriangle } from 'lucide-react';
import { format, isSameDay, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { WorkItem } from '../../types';

interface Props {
  workItems: WorkItem[];
}

export default function DateCalendarWidget({ workItems }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const todayDeadlines = workItems.filter(item =>
    item.dueDate && isSameDay(new Date(item.dueDate), today)
  );

  const upcomingDeadlines = workItems.filter(item => {
    if (!item.dueDate) return false;
    const due = new Date(item.dueDate);
    return due > today && due <= addDays(today, 3);
  });

  const totalNotifications = todayDeadlines.length + upcomingDeadlines.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:shadow-md transition-all"
      >
        <Calendar size={18} className="text-slate-600" />
        {totalNotifications > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalNotifications > 9 ? '9+' : totalNotifications}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
            </div>

            {totalNotifications === 0 ? (
              <div className="px-4 py-6 text-center">
                <Calendar size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No notifications</p>
              </div>
            ) : (
              <>
                {todayDeadlines.length > 0 && (
                  <div className="px-4 py-3">
                    <h4 className="text-xs font-bold text-error uppercase mb-2 flex items-center gap-1.5">
                      <Pin size={12} className="text-error" />
                      Today's Deadlines
                    </h4>
                    {todayDeadlines.slice(0, 3).map(item => (
                      <div key={item.id} className="text-sm text-slate-700 py-1">
                        • {item.title}
                      </div>
                    ))}
                  </div>
                )}

                {upcomingDeadlines.length > 0 && (
                  <div className="px-4 py-3 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-amber-600 uppercase mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-amber-500" />
                      Upcoming (3 days)
                    </h4>
                    {upcomingDeadlines.slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between text-sm text-slate-700 py-1">
                        <span>• {item.title}</span>
                        <span className="text-slate-400">
                          {format(new Date(item.dueDate!), 'MMM d')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
