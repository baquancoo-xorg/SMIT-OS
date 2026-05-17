import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface DismissPayload {
  personnelId: string;
  flagCode: string;
  snoozeDays?: 7 | 14 | 30;
}

export function useDismissFlagMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DismissPayload) => api.post('/personnel/dismissals', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personnel-dashboard'] }),
  });
}
