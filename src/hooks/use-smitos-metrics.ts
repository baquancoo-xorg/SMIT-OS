import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

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
