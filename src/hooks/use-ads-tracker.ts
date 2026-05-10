import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAdsCampaignsQuery(params?: { from?: string; to?: string }) {
  const qp = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => !!v) as [string, string][])
    : undefined;
  return useQuery({
    queryKey: ['ads-campaigns', qp],
    queryFn: async () => {
      const res = await api.getAdsCampaigns(qp);
      return res.data.campaigns;
    },
    staleTime: 60_000,
  });
}

export function useAdsCampaignDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['ads-campaign-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No campaign id');
      const res = await api.getAdsCampaignDetail(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useAdsAttributionQuery(params?: { from?: string; to?: string }) {
  const qp = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => !!v) as [string, string][])
    : undefined;
  return useQuery({
    queryKey: ['ads-attribution', qp],
    queryFn: async () => {
      const res = await api.getAdsAttribution(qp);
      return res.data.campaigns;
    },
    staleTime: 60_000,
  });
}

export function useAdsAttributionUnmatchedQuery(params?: { from?: string; to?: string }) {
  const qp = params
    ? Object.fromEntries(Object.entries(params).filter(([, v]) => !!v) as [string, string][])
    : undefined;
  return useQuery({
    queryKey: ['ads-attribution-unmatched', qp],
    queryFn: async () => {
      const res = await api.getAdsAttributionUnmatched(qp);
      return res.data.unmatched;
    },
    staleTime: 60_000,
  });
}

export function useTriggerAdsSyncMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accountId?: string) => api.triggerAdsSync(accountId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['ads-campaigns'] });
      void qc.invalidateQueries({ queryKey: ['ads-attribution'] });
    },
  });
}
