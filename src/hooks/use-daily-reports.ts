import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { DailyReport } from '../types';

const QUERY_KEY = 'daily-reports';

export function useDailyReportsQuery() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => api.get<DailyReport[]>('/daily-reports'),
    staleTime: 30_000,
  });
}

export function useDailyReportQuery(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => (id ? api.get<DailyReport>(`/daily-reports/${id}`) : null),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useApproveDailyReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      api.post<void>(`/daily-reports/${id}/approve`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useInvalidateDailyReports() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
}
