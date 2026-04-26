import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useSyncNowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.triggerLeadSyncNow(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['lead-sync-status'] });
    },
  });
}

export function useSyncStatusQuery(enabled: boolean) {
  const [isVisible, setIsVisible] = useState(
    typeof document === 'undefined' ? true : document.visibilityState === 'visible'
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const onVisibility = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const query = useQuery({
    queryKey: ['lead-sync-status'],
    queryFn: () => api.getLeadSyncStatus(),
    enabled,
    refetchInterval: enabled && isVisible ? 30_000 : false,
  });

  const refetch = query.refetch;

  useEffect(() => {
    if (!enabled || !isVisible) return;
    void refetch();
  }, [enabled, isVisible, refetch]);

  return query;
}
