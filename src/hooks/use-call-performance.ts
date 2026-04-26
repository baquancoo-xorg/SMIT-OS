import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api-client';
import type { CallPerformanceResponse } from '../types/call-performance';

interface CallPerformanceParams {
  from: string;
  to: string;
  aeId?: string;
}

export function useCallPerformance(params: CallPerformanceParams) {
  return useQuery({
    queryKey: ['dashboard', 'call-performance', params],
    queryFn: () =>
      apiGet<CallPerformanceResponse>('/api/dashboard/call-performance', {
        from: params.from,
        to: params.to,
        aeId: params.aeId,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
