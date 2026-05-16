import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface PmNote {
  id: string;
  personnelId: string;
  quarter: string;
  authorId: string;
  author: { id: string; fullName: string; username: string; avatar: string };
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function usePmNotesQuery(personnelId: string | null) {
  return useQuery({
    queryKey: ['pm-notes', personnelId],
    queryFn: () => (personnelId ? api.get<PmNote[]>(`/personnel/${personnelId}/pm-notes`) : []),
    enabled: !!personnelId,
    staleTime: 30_000,
  });
}

export function useCreatePmNoteMutation(personnelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { quarter: string; content: string }) =>
      api.post<PmNote>(`/personnel/${personnelId}/pm-notes`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pm-notes', personnelId] }),
  });
}

export function useUpdatePmNoteMutation(personnelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      api.put<PmNote>(`/personnel/${personnelId}/pm-notes/${noteId}`, { content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pm-notes', personnelId] }),
  });
}

export function useDeletePmNoteMutation(personnelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => api.delete(`/personnel/${personnelId}/pm-notes/${noteId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pm-notes', personnelId] }),
  });
}
