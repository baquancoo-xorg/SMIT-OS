import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export type CommentItem = {
  id: string;
  reportId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  body: string;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
};

const QUERY_KEY = 'daily-report-comments';

export function useDailyReportCommentsQuery(reportId: string | null) {
  return useSuspenseQuery({
    queryKey: [QUERY_KEY, reportId],
    queryFn: async () => {
      if (!reportId) return [];
      return api.get<CommentItem[]>(`/daily-reports/${reportId}/comments`);
    },
    staleTime: 30_000,
  });
}

export function useCreateCommentMutation(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      return api.post<CommentItem>(`/daily-reports/${reportId}/comments`, { body });
    },
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, reportId] });
      const previous = queryClient.getQueryData<CommentItem[]>([QUERY_KEY, reportId]);
      const optimistic: CommentItem = {
        id: `temp-${Date.now()}`,
        reportId,
        authorId: '',
        authorName: 'Đang gửi...',
        authorAvatarUrl: null,
        body,
        editedAt: null,
        deletedAt: null,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<CommentItem[]>([QUERY_KEY, reportId], (old) => [...(old ?? []), optimistic]);
      return { previous };
    },
    onError: (_err, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData([QUERY_KEY, reportId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, reportId] });
    },
  });
}

export function useUpdateCommentMutation(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, body }: { commentId: string; body: string }) => {
      return api.fetch<CommentItem>(`/daily-reports/${reportId}/comments/${commentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ body }),
      });
    },
    onMutate: async ({ commentId, body }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, reportId] });
      const previous = queryClient.getQueryData<CommentItem[]>([QUERY_KEY, reportId]);
      queryClient.setQueryData<CommentItem[]>([QUERY_KEY, reportId], (old) =>
        (old ?? []).map((c) => (c.id === commentId ? { ...c, body, editedAt: new Date().toISOString() } : c))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([QUERY_KEY, reportId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, reportId] });
    },
  });
}

export function useDeleteCommentMutation(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      await api.fetch(`/daily-reports/${reportId}/comments/${commentId}`, { method: 'DELETE' });
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, reportId] });
      const previous = queryClient.getQueryData<CommentItem[]>([QUERY_KEY, reportId]);
      queryClient.setQueryData<CommentItem[]>([QUERY_KEY, reportId], (old) =>
        (old ?? []).map((c) => (c.id === commentId ? { ...c, deletedAt: new Date().toISOString() } : c))
      );
      return { previous };
    },
    onError: (_err, _commentId, context) => {
      if (context?.previous) {
        queryClient.setQueryData([QUERY_KEY, reportId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, reportId] });
    },
  });
}
