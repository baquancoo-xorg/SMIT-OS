import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api-client';
import type { LeadDistributionResponse } from '../types/lead-distribution';

interface LeadDistributionParams {
  from: string;
  to: string;
  topSources?: number;
}

export function useLeadDistribution(params: LeadDistributionParams) {
  return useQuery({
    queryKey: ['dashboard', 'lead-distribution', params],
    queryFn: () =>
      apiGet<LeadDistributionResponse>('/api/dashboard/lead-distribution', {
        from: params.from,
        to: params.to,
        topSources: params.topSources?.toString(),
      }),
    enabled: Boolean(params.from && params.to),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
