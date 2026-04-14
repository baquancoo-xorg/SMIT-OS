import { useMemo } from 'react';
import { WorkItem, Objective, Sprint } from '../types';

interface DashboardMetrics {
  companyOKRProgress: number;
  l1Objectives: Objective[];
  currentSprint: Sprint | null;
  daysLeft: number;
  sprintProgress: number;
  flowEfficiency: number;
  activeBlockers: number;
  weeklyVelocity: number;
  createdThisWeek: number;
  completedThisWeek: number;
  departmentData: { name: string; value: number }[];
  statusData: { name: string; value: number; color: string }[];
  urgentItems: WorkItem[];
  criticalObjectives: Objective[];
}

export function usePMDashboardMetrics(
  workItems: WorkItem[],
  objectives: Objective[],
  sprints: Sprint[]
): DashboardMetrics {
  const now = useMemo(() => new Date(), []);
  const weekAgo = useMemo(() => {
    const date = new Date(now);
    date.setDate(date.getDate() - 7);
    return date;
  }, [now]);

  const l1Objectives = useMemo(
    () => objectives.filter((obj) => obj.level === 'L1' || obj.department === 'BOD'),
    [objectives]
  );

  const companyOKRProgress = useMemo(() => {
    if (l1Objectives.length === 0) return 0;
    return l1Objectives.reduce((sum, obj) => sum + obj.progressPercentage, 0) / l1Objectives.length;
  }, [l1Objectives]);

  const currentSprint = useMemo(
    () => sprints.find((s) => new Date(s.startDate) <= now && new Date(s.endDate) >= now) || null,
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

  const { flowEfficiency, activeBlockers } = useMemo(() => {
    const done = workItems.filter((i) => i.status === 'Done');
    const inProgress = workItems.filter((i) => i.status === 'InProgress');
    const blockers = workItems.filter((i) => i.priority === 'Critical' && i.status !== 'Done');

    return {
      flowEfficiency:
        inProgress.length > 0 ? (done.length / (done.length + inProgress.length)) * 100 : 0,
      activeBlockers: blockers.length,
    };
  }, [workItems]);

  const { createdThisWeek, completedThisWeek } = useMemo(
    () => ({
      createdThisWeek: workItems.filter((i) => i.createdAt && new Date(i.createdAt) >= weekAgo)
        .length,
      completedThisWeek: workItems.filter(
        (i) => i.status === 'Done' && i.updatedAt && new Date(i.updatedAt) >= weekAgo
      ).length,
    }),
    [workItems, weekAgo]
  );

  const departmentData = useMemo(() => {
    const deptMap: Record<string, number> = {};
    workItems.forEach((item) => {
      const depts = item.assignee?.departments || ['Unassigned'];
      depts.forEach(dept => {
        deptMap[dept] = (deptMap[dept] || 0) + 1;
      });
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
    workItems.forEach((item) => {
      statusMap[item.status] = (statusMap[item.status] || 0) + 1;
    });

    return Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
      color: statusColors[name] || '#6b7280',
    }));
  }, [workItems]);

  const urgentItems = useMemo(
    () =>
      workItems
        .filter((i) => i.priority === 'Critical' || i.priority === 'High')
        .filter((i) => i.status !== 'Done')
        .slice(0, 5),
    [workItems]
  );

  const criticalObjectives = useMemo(
    () => objectives.filter((obj) => obj.progressPercentage < 30).slice(0, 3),
    [objectives]
  );

  const weeklyVelocity = useMemo(() => {
    return workItems
      .filter((i) => i.status === 'Done' && i.updatedAt && new Date(i.updatedAt) >= weekAgo)
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
