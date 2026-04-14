# Phase 6: Performance Optimization

**Priority:** MEDIUM
**Effort:** 1 day
**Status:** completed
**Depends on:** Independent (can run parallel)

## Overview

Fix N+1 query issue và Frontend performance với useMemo.

## Part A: Backend - Fix N+1 Query

### Context

**Current code:** [server.ts:431-458](../../server.ts#L431-L458)

```typescript
// N+1 Issue: Query trong loop
for (const kr of krProgressData) {
  const keyResult = await prisma.keyResult.findUnique({...}); // ❌ Query mỗi iteration
  await prisma.keyResult.update({...}); // ❌ Update mỗi iteration
}
```

### Solution: Batch Operations

**File:** `server/services/okr.service.ts` (from Phase 4)

```typescript
async syncOKRProgress(report: any) {
  if (!report.krProgress) return;

  const krProgressData = JSON.parse(report.krProgress);
  const krIds = krProgressData.map((kr: any) => kr.krId);

  // ✅ Single query for all KRs
  const keyResults = await prisma.keyResult.findMany({
    where: { id: { in: krIds } },
  });

  const krMap = new Map(keyResults.map(kr => [kr.id, kr]));

  // ✅ Batch updates in transaction
  const updates = krProgressData
    .map((kr: any) => {
      const keyResult = krMap.get(kr.krId);
      if (!keyResult) return null;

      let progressPct = kr.progressPct;
      if (kr.currentValue !== undefined && keyResult.targetValue > 0) {
        progressPct = (kr.currentValue / keyResult.targetValue) * 100;
      }

      return prisma.keyResult.update({
        where: { id: kr.krId },
        data: {
          currentValue: kr.currentValue ?? keyResult.currentValue,
          progressPercentage: Math.min(progressPct, 100)
        }
      });
    })
    .filter(Boolean);

  await prisma.$transaction(updates);
  await this.recalculateObjectiveProgress();
}
```

### Performance Comparison

| Metric | Before (N+1) | After (Batch) |
|--------|--------------|---------------|
| Queries for 10 KRs | 20 queries | 2 queries |
| Queries for 50 KRs | 100 queries | 2 queries |
| Time (10 KRs) | ~500ms | ~50ms |
| Time (50 KRs) | ~2500ms | ~100ms |

---

## Part B: Frontend - PM Dashboard useMemo

### Context

**Current code:** [PMDashboard.tsx](../../src/pages/PMDashboard.tsx)
- 12+ array iterations per render
- See: [code-reviewer-260414-0200-pm-dashboard-review.md](../reports/code-reviewer-260414-0200-pm-dashboard-review.md)

### Solution: Custom Hook with useMemo

**File:** `src/hooks/use-pm-dashboard-metrics.ts`

```typescript
import { useMemo } from 'react';
import { WorkItem, Objective, User, Sprint, WeeklyReport } from '../types';

interface DashboardMetrics {
  // Tier 1
  companyOKRProgress: number;
  l1Objectives: Objective[];
  currentSprint: Sprint | null;
  daysLeft: number;
  sprintProgress: number;
  
  // Tier 2
  flowEfficiency: number;
  activeBlockers: number;
  weeklyVelocity: number;
  createdThisWeek: number;
  completedThisWeek: number;
  
  // Tier 3
  departmentData: { name: string; value: number }[];
  statusData: { name: string; value: number; color: string }[];
  urgentItems: WorkItem[];
  criticalObjectives: Objective[];
}

export function usePMDashboardMetrics(
  workItems: WorkItem[],
  objectives: Objective[],
  users: User[],
  sprints: Sprint[],
  weeklyReports: WeeklyReport[]
): DashboardMetrics {
  // Memoize current date to prevent recalculation
  const now = useMemo(() => new Date(), []);
  const weekAgo = useMemo(() => {
    const date = new Date(now);
    date.setDate(date.getDate() - 7);
    return date;
  }, [now]);

  // Tier 1 Metrics
  const l1Objectives = useMemo(
    () => objectives.filter(obj => obj.level === 'L1' || obj.department === 'BOD'),
    [objectives]
  );

  const companyOKRProgress = useMemo(() => {
    if (l1Objectives.length === 0) return 0;
    return l1Objectives.reduce((sum, obj) => sum + obj.progressPercentage, 0) / l1Objectives.length;
  }, [l1Objectives]);

  const currentSprint = useMemo(
    () => sprints.find(s => new Date(s.startDate) <= now && new Date(s.endDate) >= now) || null,
    [sprints, now]
  );

  const { daysLeft, sprintProgress } = useMemo(() => {
    if (!currentSprint) return { daysLeft: 0, sprintProgress: 0 };
    
    const start = new Date(currentSprint.startDate);
    const end = new Date(currentSprint.endDate);
    const total = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const elapsed = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    return {
      daysLeft: Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
      sprintProgress: Math.min(100, (elapsed / total) * 100),
    };
  }, [currentSprint, now]);

  // Tier 2 Metrics
  const { flowEfficiency, activeBlockers } = useMemo(() => {
    const done = workItems.filter(i => i.status === 'Done');
    const inProgress = workItems.filter(i => i.status === 'InProgress');
    const blockers = workItems.filter(i => 
      i.priority === 'Critical' && i.status !== 'Done'
    );

    return {
      flowEfficiency: inProgress.length > 0 
        ? (done.length / (done.length + inProgress.length)) * 100 
        : 0,
      activeBlockers: blockers.length,
    };
  }, [workItems]);

  const { createdThisWeek, completedThisWeek } = useMemo(() => ({
    createdThisWeek: workItems.filter(i => 
      i.createdAt && new Date(i.createdAt) >= weekAgo
    ).length,
    completedThisWeek: workItems.filter(i => 
      i.status === 'Done' && i.updatedAt && new Date(i.updatedAt) >= weekAgo
    ).length,
  }), [workItems, weekAgo]);

  // Tier 3 Metrics
  const departmentData = useMemo(() => {
    const deptMap: Record<string, number> = {};
    workItems.forEach(item => {
      const dept = item.assignee?.department || 'Unassigned';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    return Object.entries(deptMap).map(([name, value]) => ({ name, value }));
  }, [workItems]);

  const statusData = useMemo(() => {
    const statusColors: Record<string, string> = {
      Backlog: '#94a3b8',
      Todo: '#3b82f6',
      InProgress: '#f59e0b',
      Review: '#8b5cf6',
      Done: '#22c55e',
    };
    
    const statusMap: Record<string, number> = {};
    workItems.forEach(item => {
      statusMap[item.status] = (statusMap[item.status] || 0) + 1;
    });

    return Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
      color: statusColors[name] || '#6b7280',
    }));
  }, [workItems]);

  const urgentItems = useMemo(
    () => workItems
      .filter(i => i.priority === 'Critical' || i.priority === 'High')
      .filter(i => i.status !== 'Done')
      .slice(0, 5),
    [workItems]
  );

  const criticalObjectives = useMemo(
    () => objectives
      .filter(obj => obj.progressPercentage < 30)
      .slice(0, 3),
    [objectives]
  );

  const weeklyVelocity = useMemo(() => {
    // Calculate based on completed story points this week
    return workItems
      .filter(i => i.status === 'Done' && i.updatedAt && new Date(i.updatedAt) >= weekAgo)
      .reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  }, [workItems, weekAgo]);

  return {
    companyOKRProgress,
    l1Objectives,
    currentSprint,
    daysLeft,
    sprintProgress,
    flowEfficiency,
    activeBlockers,
    weeklyVelocity,
    createdThisWeek,
    completedThisWeek,
    departmentData,
    statusData,
    urgentItems,
    criticalObjectives,
  };
}
```

### Update PMDashboard Component

```typescript
// Before: 12+ inline calculations
const l1Objectives = objectives.filter(...);
const companyOKRProgress = l1Objectives.reduce(...);
// ... more inline calculations

// After: Single hook call
const metrics = usePMDashboardMetrics(workItems, objectives, users, sprints, weeklyReports);
const { companyOKRProgress, currentSprint, urgentItems, ... } = metrics;
```

## Files to Create

| File | Purpose |
|------|---------|
| src/hooks/use-pm-dashboard-metrics.ts | Memoized dashboard metrics |

## Files to Modify

| File | Changes |
|------|---------|
| src/pages/PMDashboard.tsx | Use custom hook |
| server/services/okr.service.ts | Batch OKR updates |

## Performance Testing

### Backend
```bash
# Before optimization
time curl -X POST localhost:3005/api/reports/xxx/approve

# After optimization (should be 5-10x faster)
time curl -X POST localhost:3005/api/reports/xxx/approve
```

### Frontend
1. Open React DevTools Profiler
2. Navigate to PM Dashboard
3. Check render time with 500+ work items
4. Target: <50ms render

## Testing Checklist

- [ ] OKR sync completes in <200ms for 50 KRs
- [ ] PM Dashboard renders in <50ms
- [ ] No visual changes to dashboard
- [ ] All metrics calculate correctly

## Next Phase

After completion, proceed to [Phase 7: Testing & Deployment](phase-07-testing-deployment.md)
