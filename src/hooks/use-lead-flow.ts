import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api-client';
import type { LeadFlowResponse } from '../types/lead-flow';

interface LeadFlowParams {
  from: string;
  to: string;
}

export function useLeadFlow(params: LeadFlowParams) {
  return useQuery({
    queryKey: ['dashboard', 'lead-flow', params],
    queryFn: () =>
      apiGet<LeadFlowResponse>('/api/dashboard/lead-flow', {
        from: params.from,
        to: params.to,
      }),
    enabled: Boolean(params.from && params.to),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
