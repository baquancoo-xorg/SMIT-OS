# Phase 3: Sprint Context Widget

## Overview

Widget hiển thị current sprint với progress bar mini, click mở dropdown với stats.

## Design

**Compact View:**
```
┌────────────────────────────────┐
│ 📊 Sprint 5 ████████░░░░ 68%  │
└────────────────────────────────┘
```

**Dropdown:**
```
┌──────────────────────────────────┐
│ Sprint 5: Auth & Profile         │
│ Apr 8 - Apr 22 (8 days left)     │
├──────────────────────────────────┤
│ Progress  ████████░░░░ 68%       │
├──────────────────────────────────┤
│ ✅ Done        12                │
│ 🔄 In Progress  5                │
│ 📋 Todo         4                │
│ 🚫 Blocked      2                │
├──────────────────────────────────┤
│ [View Sprint Board →]            │
└──────────────────────────────────┘
```

## Implementation

**New File:** `src/components/layout/SprintContextWidget.tsx`

```tsx
import { useState, useRef, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

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

export default function SprintContextWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch active sprint
  useEffect(() => {
    fetch('/api/sprints/active')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
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
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-24 h-4 bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!data?.sprint) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-slate-400 text-sm">
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
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <BarChart3 size={16} className="text-slate-500" />
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
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">✅ Done</span>
                <span className="font-bold text-slate-800">{stats?.done}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🔄 In Progress</span>
                <span className="font-bold text-slate-800">{stats?.inProgress}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">📋 Todo</span>
                <span className="font-bold text-slate-800">{stats?.todo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">🚫 Blocked</span>
                <span className="font-bold text-red-500">{stats?.blocked}</span>
              </div>
            </div>

            {/* Action */}
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/product-backlog');
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
```

## Header.tsx Integration

```tsx
// Import
import DateCalendarWidget from './DateCalendarWidget';
import SprintContextWidget from './SprintContextWidget';

// In JSX, after search bar div
<div className="flex items-center gap-2">
  <DateCalendarWidget workItems={allWorkItems} />
  <SprintContextWidget />
</div>
```

## Tasks

- [x] Create `SprintContextWidget.tsx`
- [x] Update Header.tsx imports and layout
- [x] Test loading/empty/data states
- [x] Test dropdown functionality
- [x] Test "View Sprint Board" navigation
- [x] Test responsive behavior

## Mobile Considerations

```tsx
// Hide on small screens
<div className="hidden md:flex items-center gap-2">
  <DateCalendarWidget workItems={allWorkItems} />
  <SprintContextWidget />
</div>
```

## Notes

- Separate fetch for sprint data (không phụ thuộc workItems)
- Navigate to `/product-backlog` for sprint board
- Loading skeleton while fetching
- Graceful fallback when no active sprint
