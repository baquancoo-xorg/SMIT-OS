# Phase 2: Extract useDailyReportForm Hook

**Effort:** 2h | **Priority:** P1 | **Status:** completed

## Problem

4 daily-report forms duplicate ~300 lines of identical state management:
- TechDailyForm.tsx
- MediaDailyForm.tsx
- SaleDailyForm.tsx
- MarketingDailyForm.tsx

## Tasks

### 2.1 Create useDailyReportForm Hook

**Create src/hooks/use-daily-report-form.ts:**
```typescript
import { useState, useCallback } from 'react';
import { WorkItem, BlockerEntry, TodayPlanEntry, AdHocTask } from '../types';

interface UseDailyReportFormOptions<TMetrics> {
  defaultMetrics: TMetrics;
}

export function useDailyReportForm<TMetrics>(options: UseDailyReportFormOptions<TMetrics>) {
  const [taskStatuses, setTaskStatuses] = useState<Record<string, 'done' | 'doing'>>({});
  const [taskMetrics, setTaskMetrics] = useState<Record<string, TMetrics>>({});
  const [blockers, setBlockers] = useState<BlockerEntry[]>([]);
  const [todayPlans, setTodayPlans] = useState<TodayPlanEntry[]>([]);
  const [adHocTasks, setAdHocTasks] = useState<AdHocTask[]>([]);

  const updateTaskStatus = useCallback((taskId: string, status: 'done' | 'doing') => {
    setTaskStatuses(prev => ({ ...prev, [taskId]: status }));
  }, []);

  const updateTaskMetrics = useCallback((taskId: string, metrics: Partial<TMetrics>) => {
    setTaskMetrics(prev => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || options.defaultMetrics), ...metrics }
    }));
  }, [options.defaultMetrics]);

  const addBlocker = useCallback(() => {
    setBlockers(prev => [...prev, { 
      id: crypto.randomUUID(),
      description: '', 
      relatedTaskId: '', 
      severity: 'medium',
      tags: []
    }]);
  }, []);

  const updateBlocker = useCallback((index: number, field: keyof BlockerEntry, value: string) => {
    setBlockers(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  }, []);

  const removeBlocker = useCallback((index: number) => {
    setBlockers(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addTodayPlan = useCallback(() => {
    setTodayPlans(prev => [...prev, {
      id: crypto.randomUUID(),
      description: '',
      relatedTaskId: '',
      estimatedHours: 1,
      priority: false
    }]);
  }, []);

  const updateTodayPlan = useCallback((index: number, field: keyof TodayPlanEntry, value: any) => {
    setTodayPlans(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }, []);

  const removeTodayPlan = useCallback((index: number) => {
    setTodayPlans(prev => prev.filter((_, i) => i !== index));
  }, []);

  // AdHoc tasks handlers
  const addAdHocTask = useCallback(() => {
    setAdHocTasks(prev => [...prev, {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium'
    }]);
  }, []);

  const updateAdHocTask = useCallback((index: number, field: keyof AdHocTask, value: any) => {
    setAdHocTasks(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  }, []);

  const removeAdHocTask = useCallback((index: number) => {
    setAdHocTasks(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setTaskStatuses({});
    setTaskMetrics({});
    setBlockers([]);
    setTodayPlans([]);
    setAdHocTasks([]);
  }, []);

  return {
    // State
    taskStatuses,
    taskMetrics,
    blockers,
    todayPlans,
    adHocTasks,
    // Task handlers
    updateTaskStatus,
    updateTaskMetrics,
    // Blocker handlers
    addBlocker,
    updateBlocker,
    removeBlocker,
    // Today plan handlers
    addTodayPlan,
    updateTodayPlan,
    removeTodayPlan,
    // AdHoc handlers
    addAdHocTask,
    updateAdHocTask,
    removeAdHocTask,
    // Utilities
    reset,
  };
}
```

### 2.2 Refactor TechDailyForm.tsx

**Before (~120 lines of state):**
```tsx
const [taskStatuses, setTaskStatuses] = useState<Record<string, 'done' | 'doing'>>({});
const [taskMetrics, setTaskMetrics] = useState<Record<string, TechMetrics>>({});
// ... 100+ more lines
```

**After (~10 lines):**
```tsx
import { useDailyReportForm } from '../../hooks/use-daily-report-form';

const defaultTechMetrics: TechMetrics = { commits: 0, prsOpened: 0, prsMerged: 0, codeReviews: 0 };

const {
  taskStatuses, taskMetrics, blockers, todayPlans, adHocTasks,
  updateTaskStatus, updateTaskMetrics,
  addBlocker, updateBlocker, removeBlocker,
  addTodayPlan, updateTodayPlan, removeTodayPlan,
  addAdHocTask, updateAdHocTask, removeAdHocTask,
} = useDailyReportForm<TechMetrics>({ defaultMetrics: defaultTechMetrics });
```

### 2.3 Refactor Other Forms

Apply same pattern to:
- MediaDailyForm.tsx (MediaMetrics)
- SaleDailyForm.tsx (SaleMetrics)
- MarketingDailyForm.tsx (MarketingMetrics)

## Checklist

- [ ] useDailyReportForm hook created
- [ ] TechDailyForm refactored to use hook
- [ ] MediaDailyForm refactored to use hook
- [ ] SaleDailyForm refactored to use hook
- [ ] MarketingDailyForm refactored to use hook
- [ ] All forms still work correctly
- [ ] TypeScript compiles without errors
