# Phase 2: Date/Calendar Widget

## Overview

Widget hiển thị ngày hôm nay, click mở dropdown với mini calendar và deadlines.

## Design

**Compact View:**
```
┌─────────────────────┐
│ 📅 Mon, Apr 14      │
└─────────────────────┘
```

**Dropdown:**
```
┌─────────────────────────────┐
│     April 2026              │
│ Su Mo Tu We Th Fr Sa        │
│        1  2  3  4  5        │
│  6  7  8  9 10 11 12        │
│ 13 [14] 15 16 17 18 19      │
│ 20 21 22 •23 24 25 26       │
│ 27 28 29 30                 │
├─────────────────────────────┤
│ 📌 Today's Deadlines        │
│ • Task A              14:00 │
│ • Task B              17:00 │
├─────────────────────────────┤
│ ⚠️ Upcoming (3 days)        │
│ • Task C          Apr 16    │
└─────────────────────────────┘
```

## Implementation

**New File:** `src/components/layout/DateCalendarWidget.tsx`

```tsx
import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { WorkItem } from '../../types';

interface Props {
  workItems: WorkItem[];
}

export default function DateCalendarWidget({ workItems }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();

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

  // Filter deadlines
  const todayDeadlines = workItems.filter(item => 
    item.dueDate && isSameDay(new Date(item.dueDate), today)
  );
  
  const upcomingDeadlines = workItems.filter(item => {
    if (!item.dueDate) return false;
    const due = new Date(item.dueDate);
    return due > today && due <= addDays(today, 3);
  });

  // Calendar days
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Calendar size={16} className="text-slate-500" />
        <span className="text-sm font-medium text-slate-700">
          {format(today, 'EEE, MMM d')}
        </span>
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
            {/* Mini Calendar */}
            <div className="p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">
                {format(today, 'MMMM yyyy')}
              </h3>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <div key={d} className="text-slate-400 font-medium py-1">{d}</div>
                ))}
                {/* Padding for first week */}
                {Array(monthStart.getDay()).fill(null).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {days.map(day => (
                  <div
                    key={day.toISOString()}
                    className={`py-1 rounded-lg ${
                      isToday(day) 
                        ? 'bg-primary text-white font-bold' 
                        : 'text-slate-600'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Deadlines */}
            {todayDeadlines.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                  📌 Today's Deadlines
                </h4>
                {todayDeadlines.slice(0, 3).map(item => (
                  <div key={item.id} className="text-sm text-slate-700 py-1">
                    • {item.title}
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming */}
            {upcomingDeadlines.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                  ⚠️ Upcoming (3 days)
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Tasks

- [x] Create `DateCalendarWidget.tsx`
- [x] Import and add to Header.tsx
- [x] Pass workItems from Header's existing fetch
- [x] Test dropdown opens/closes
- [x] Test deadlines display correctly

## Notes

- Reuse `allWorkItems` already fetched in Header.tsx
- date-fns already installed
- Mobile: widget có thể hide hoặc compact thêm
