import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAcquisitionJourneyQuery(params: { from: string; to: string }) {
  return useQuery({
    queryKey: ['acquisition-journey', params],
    queryFn: async () => {
      const res = await api.getAcquisitionJourney(params);
      return res.data;
    },
    staleTime: 5 * 60_000, // 5min cache (dashboard summaries can be slightly stale)
  });
}
