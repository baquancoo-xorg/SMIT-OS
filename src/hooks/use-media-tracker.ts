import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { MediaPost } from '../types';

export interface MediaPostsFilters {
  platform?: string;
  type?: string;
  from?: string;
  to?: string;
  search?: string;
}

export function useMediaPostsQuery(filters: MediaPostsFilters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => !!v) as [string, string][]
  );
  return useQuery({
    queryKey: ['media-posts', params],
    queryFn: async () => {
      const res = await api.getMediaPosts(params);
      return res.data.posts;
    },
    staleTime: 30_000,
  });
}

export function useCreateMediaPostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<MediaPost> & Record<string, any>) => api.createMediaPost(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['media-posts'] });
    },
  });
}

export function useUpdateMediaPostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MediaPost> & Record<string, any> }) =>
      api.updateMediaPost(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['media-posts'] });
    },
  });
}

export function useDeleteMediaPostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteMediaPost(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['media-posts'] });
    },
  });
}
