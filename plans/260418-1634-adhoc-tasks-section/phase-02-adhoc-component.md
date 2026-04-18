# Phase 2: AdHocTasksSection Component

**Status:** pending | **Effort:** 1.5h | **Priority:** high

## Overview

Tạo reusable component `AdHocTasksSection` dùng chung cho Daily và Weekly forms.

## Context

**Reference files:**
- `src/components/modals/WeeklyCheckinModal.tsx` - table styling pattern
- `src/components/daily-report/components/BlockerCard.tsx` - card pattern
- `src/components/ui/CustomSelect.tsx` - select component

## Requirements

- Table với columns: Task | Requester | Impact | Status | Hours | Actions
- Add/remove rows dynamically
- Auto-sum total hours ở footer
- Responsive (mobile scroll)
- Collapsible header với badge tổng giờ

## Implementation Steps

### 2.1 Create Component File

**File:** `src/components/daily-report/components/AdHocTasksSection.tsx`

```typescript
import { useState } from 'react';
import { Plus, Trash2, Briefcase } from 'lucide-react';
import { AdHocTask, AdHocTaskImpact, AdHocTaskStatus } from '../../../types/daily-report-metrics';
import CustomSelect from '../../ui/CustomSelect';

interface AdHocTasksSectionProps {
  tasks: AdHocTask[];
  onTasksChange: (tasks: AdHocTask[]) => void;
  teamColor?: string; // indigo, rose, amber, emerald
}

const IMPACT_OPTIONS = [
  { value: 'low', label: 'Thấp', iconColor: 'text-slate-500' },
  { value: 'medium', label: 'Trung bình', iconColor: 'text-amber-500' },
  { value: 'high', label: 'Cao', iconColor: 'text-rose-500' },
];

const STATUS_OPTIONS = [
  { value: 'in-progress', label: 'Đang làm' },
  { value: 'done', label: 'Hoàn thành' },
];
```

### 2.2 Component Structure

```tsx
export default function AdHocTasksSection({ tasks, onTasksChange, teamColor = 'indigo' }: AdHocTasksSectionProps) {
  const totalHours = tasks.reduce((sum, t) => sum + (t.hoursSpent || 0), 0);

  const addTask = () => {
    onTasksChange([...tasks, {
      id: Date.now(),
      name: '',
      requester: '',
      impact: 'low',
      status: 'in-progress',
      hoursSpent: 0,
    }]);
  };

  const updateTask = (id: number, field: keyof AdHocTask, value: string | number) => {
    onTasksChange(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTask = (id: number) => {
    onTasksChange(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      {/* Header with badge */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Briefcase size={18} className={`text-${teamColor}-500`} />
          Công việc phát sinh
          {totalHours > 0 && (
            <span className={`bg-${teamColor}-100 text-${teamColor}-700 text-xs font-bold px-2 py-0.5 rounded-full`}>
              {totalHours}h
            </span>
          )}
        </h3>
        <button onClick={addTask} className={`text-${teamColor}-600 ...`}>
          <Plus size={16} /> Thêm
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {/* ... columns: Task, Requester, Impact, Status, Hours, Actions */}
        </table>
      </div>

      {/* Footer with total */}
      {tasks.length > 0 && (
        <div className="mt-3 pt-3 border-t text-right">
          <span className="font-bold">Tổng: {totalHours}h</span>
        </div>
      )}
    </div>
  );
}
```

### 2.3 Empty State

```tsx
{tasks.length === 0 && (
  <div className="text-center py-6 bg-slate-50 rounded-xl border-dashed border">
    <Briefcase className="mx-auto text-slate-300 mb-2" size={24} />
    <p className="text-sm text-slate-500">Không có công việc phát sinh</p>
  </div>
)}
```

## Todo

- [ ] Create AdHocTasksSection.tsx
- [ ] Implement add/remove/update logic
- [ ] Style table responsive
- [ ] Add empty state
- [ ] Export from index

## Success Criteria

- [ ] Component renders correctly
- [ ] Add/remove rows works
- [ ] Auto-sum calculates
- [ ] Mobile responsive
