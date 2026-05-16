import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface JiraSummary {
  total: number;
  done: number;
  inProgress: number;
  toDo: number;
  blocked: number;
  overdue: number;
  completionRate: number;
  recent: Array<{
    key: string;
    summary: string;
    status: string;
    statusCategory: string;
    dueDate: string | null;
    updatedAt: string;
  }>;
}

export interface JiraResponse {
  configured: boolean;
  accountMapped: boolean;
  summary: JiraSummary | null;
  error?: string;
}

export interface SmitosSnapshot {
  attendance: {
    submitted: number;
    businessDays: number;
    rate: number;
    daily: Array<{ date: string; submitted: boolean }>;
  };
  krs: Array<{ id: string; title: string; progress: number; current: number; target: number; unit: string }>;
  generatedAt: string;
}

export function useJiraTasksQuery(personnelId: string | null) {
  return useQuery({
    queryKey: ['personnel-jira', personnelId],
    queryFn: () =>
      personnelId ? api.get<JiraResponse>(`/personnel/${personnelId}/jira-tasks`) : null,
    enabled: !!personnelId,
    staleTime: 5 * 60_000,
  });
}

export function useRefreshJiraMutation(personnelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.get<JiraResponse>(`/personnel/${personnelId}/jira-tasks?refresh=1`),
    onSuccess: (data) => qc.setQueryData(['personnel-jira', personnelId], data),
  });
}

export function useSmitosMetricsQuery(personnelId: string | null) {
  return useQuery({
    queryKey: ['personnel-smitos', personnelId],
    queryFn: () =>
      personnelId ? api.get<SmitosSnapshot>(`/personnel/${personnelId}/smitos-metrics`) : null,
    enabled: !!personnelId,
    staleTime: 5 * 60_000,
  });
}

export function useRefreshSmitosMutation(personnelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.get<SmitosSnapshot>(`/personnel/${personnelId}/smitos-metrics?refresh=1`),
    onSuccess: (data) => qc.setQueryData(['personnel-smitos', personnelId], data),
  });
}
