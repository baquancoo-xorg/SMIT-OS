import { useState, useCallback } from 'react';
import { BlockerEntry, TodayPlanEntry, AdHocTask } from '../types/daily-report-metrics';

interface UseDailyReportFormOptions<TMetrics> {
  defaultMetrics: TMetrics;
}

export function useDailyReportForm<TMetrics>(options: UseDailyReportFormOptions<TMetrics>) {
  const [taskStatuses, setTaskStatuses] = useState<Record<string, 'done' | 'doing'>>({});
  const [taskMetrics, setTaskMetrics] = useState<Record<string, TMetrics>>({});
  const [blockers, setBlockers] = useState<BlockerEntry[]>([]);
  const [todayPlans, setTodayPlans] = useState<TodayPlanEntry[]>([]);
  const [adHocTasks, setAdHocTasks] = useState<AdHocTask[]>([]);

  const handleTaskStatusChange = useCallback((taskId: string, status: 'done' | 'doing') => {
    setTaskStatuses((prev) => {
      if (prev[taskId] === status) {
        const newState = { ...prev };
        delete newState[taskId];
        return newState;
      }
      return { ...prev, [taskId]: status };
    });
    setTaskMetrics((prev) => {
      if (!prev[taskId]) {
        return { ...prev, [taskId]: options.defaultMetrics };
      }
      return prev;
    });
  }, [options.defaultMetrics]);

  const updateTaskMetric = useCallback((taskId: string, field: keyof TMetrics, value: string | number | boolean) => {
    setTaskMetrics((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], [field]: value },
    }));
  }, []);

  const addBlocker = useCallback(() => {
    setBlockers((prev) => [
      ...prev,
      { id: `b${Date.now()}`, description: '', impact: 'none', tags: [] },
    ]);
  }, []);

  const updateBlocker = useCallback((id: string, field: keyof BlockerEntry, value: string) => {
    setBlockers((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }, []);

  const removeBlocker = useCallback((id: string) => {
    setBlockers((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const appendBlockerTag = useCallback((id: string, tag: string) => {
    setBlockers((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, description: b.description ? `${b.description} ${tag}` : tag }
          : b
      )
    );
  }, []);

  const addTodayPlan = useCallback(() => {
    setTodayPlans((prev) => [
      ...prev,
      { id: `p${Date.now()}`, output: '', progress: 0, isPriority: false },
    ]);
  }, []);

  const updateTodayPlan = useCallback((id: string, field: keyof TodayPlanEntry, value: string | number | boolean) => {
    setTodayPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }, []);

  const removeTodayPlan = useCallback((id: string) => {
    setTodayPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const togglePlanPriority = useCallback((id: string) => {
    setTodayPlans((prev) => prev.map((p) => (p.id === id ? { ...p, isPriority: !p.isPriority } : p)));
  }, []);

  return {
    taskStatuses,
    taskMetrics,
    blockers,
    todayPlans,
    adHocTasks,
    setAdHocTasks,
    handleTaskStatusChange,
    updateTaskMetric,
    addBlocker,
    updateBlocker,
    removeBlocker,
    appendBlockerTag,
    addTodayPlan,
    updateTodayPlan,
    removeTodayPlan,
    togglePlanPriority,
  };
}
