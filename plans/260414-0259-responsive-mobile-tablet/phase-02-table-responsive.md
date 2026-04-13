# Phase 2: Table Responsive

## Overview

Add horizontal scroll wrappers and mobile card view alternatives for data tables.

**Priority:** Critical  
**Effort:** 2h  
**Files:** 
- `src/pages/DailySync.tsx`
- `src/components/board/TaskTableView.tsx`
- `src/components/board/ReportTableView.tsx`

## Issues

| ID | Problem | File | Impact |
|----|---------|------|--------|
| C4 | Table horizontal overflow | DailySync.tsx | Actions column hidden |
| C10 | No mobile alternative | TaskTableView.tsx | Data inaccessible |
| M11 | No min column widths | ReportTableView.tsx | Unpredictable truncation |
| M12 | Same as C10 | ProductBacklog table | Data inaccessible |
| M17 | Table overflow | WeeklyCheckinModal | Plans table unusable |

## Implementation

### Pattern: Table Scroll Wrapper

Apply to ALL tables:

```tsx
// Wrapper component for consistent table scrolling
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
  <div className="min-w-[800px]"> {/* Adjust min-width per table */}
    <table className="w-full">
      {/* table content */}
    </table>
  </div>
</div>
```

### C4: DailySync.tsx Table

**Location:** Lines 124-199

```tsx
// Wrap existing table
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 rounded-2xl">
  <div className="min-w-[700px]">
    <table className="w-full">
      <thead>
        <tr className="border-b border-outline-variant/10">
          <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[100px]">Date</th>
          <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[150px]">Team</th>
          <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[100px]">Status</th>
          <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[120px]">Blockers</th>
          <th className="text-left py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[100px]">Score</th>
          <th className="text-right py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[80px]">Actions</th>
        </tr>
      </thead>
      {/* tbody unchanged */}
    </table>
  </div>
</div>

{/* Add scroll indicator for mobile */}
<p className="text-[10px] text-slate-400 text-center mt-2 md:hidden">
  ← Scroll horizontally →
</p>
```

### C10: TaskTableView.tsx - Mobile Card Alternative

**Strategy:** Breakpoint-based view switching

```tsx
// Add at top of component
const [viewMode, setViewMode] = useState<'auto' | 'table' | 'card'>('auto');

// Determine effective view based on breakpoint
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const effectiveView = viewMode === 'auto' ? (isMobile ? 'card' : 'table') : viewMode;

// In JSX, add view toggle
<div className="flex items-center gap-2 mb-4 md:hidden">
  <button
    onClick={() => setViewMode('card')}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${effectiveView === 'card' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
  >
    Cards
  </button>
  <button
    onClick={() => setViewMode('table')}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${effectiveView === 'table' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
  >
    Table
  </button>
</div>

{/* Conditional rendering */}
{effectiveView === 'card' ? (
  <MobileCardView tasks={tasks} onTaskClick={onTaskClick} />
) : (
  <div className="overflow-x-auto">
    {/* existing table */}
  </div>
)}
```

**MobileCardView component:**

```tsx
function MobileCardView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div
          key={task.id}
          onClick={() => onTaskClick(task)}
          className="bg-white p-4 rounded-2xl border border-outline-variant/10 shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h4 className="text-sm font-bold text-on-surface line-clamp-2">{task.title}</h4>
            <span className={`text-[10px] font-black px-2 py-1 rounded-full flex-shrink-0 ${
              task.priority === 'High' ? 'bg-error/10 text-error' :
              task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
              'bg-slate-100 text-slate-500'
            }`}>
              {task.priority}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">person</span>
              {task.assignee?.fullName || 'Unassigned'}
            </span>
            <span className={`font-bold ${
              task.status === 'Done' ? 'text-tertiary' :
              task.status === 'In Progress' ? 'text-primary' :
              'text-slate-400'
            }`}>
              {task.status}
            </span>
          </div>
          
          {task.dueDate && (
            <div className="mt-2 text-[10px] text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">calendar_today</span>
              {task.dueDate}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### M11: ReportTableView.tsx - Min Column Widths

**Location:** Lines 50-156

Add `min-w-[XXpx]` to all th elements:

```tsx
<th className="... min-w-[120px]">Week</th>
<th className="... min-w-[100px]">User</th>
<th className="... min-w-[80px]">Score</th>
<th className="... min-w-[100px]">Confidence</th>
<th className="... min-w-[120px]">Status</th>
```

## Todo

- [x] Add scroll wrapper to DailySync table (C4)
- [x] Add min-widths to DailySync columns
- [x] Create MobileCardView component for TaskTableView (C10)
- [x] Add view toggle to TaskTableView
- [x] Add min-widths to ReportTableView (M11)
- [x] Apply same pattern to ProductBacklog table (M12)
- [x] Fix WeeklyCheckinModal plans table (M17)
- [x] Test all tables at 375px

## Success Criteria

- [x] All tables scrollable horizontally on mobile
- [x] Scroll indicator visible on mobile
- [x] TaskTableView shows cards by default on mobile
- [x] Card view is touch-friendly (44px+ targets)
- [x] Column content never truncates unexpectedly
