import { useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/notification-toast';
import { EmptyState } from '../ui/empty-state';
import { CommentItem } from './comment-item';
import {
  useDailyReportCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '../../../hooks/use-daily-report-comments';

interface CommentThreadProps {
  reportId: string;
  currentUserId: string;
  isAdmin: boolean;
}

export function CommentThread({ reportId, currentUserId, isAdmin }: CommentThreadProps) {
  const { data: comments } = useDailyReportCommentsQuery(reportId);
  const createMutation = useCreateCommentMutation(reportId);
  const updateMutation = useUpdateCommentMutation(reportId);
  const deleteMutation = useDeleteCommentMutation(reportId);
  const [body, setBody] = useState('');
  const { toast } = useToast();

  const handleSubmit = useCallback(() => {
    const trimmed = body.trim();
    if (!trimmed) return;
    createMutation.mutate(trimmed, {
      onSuccess: () => { setBody(''); toast({ tone: 'success', title: 'Đã gửi bình luận' }); },
      onError: () => toast({ tone: 'error', title: 'Không thể gửi bình luận' }),
    });
  }, [body, createMutation, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleEdit = useCallback((commentId: string, newBody: string) => {
    updateMutation.mutate({ commentId, body: newBody }, {
      onSuccess: () => toast({ tone: 'success', title: 'Đã cập nhật' }),
      onError: () => toast({ tone: 'error', title: 'Không thể cập nhật' }),
    });
  }, [updateMutation, toast]);

  const handleDelete = useCallback((commentId: string) => {
    deleteMutation.mutate(commentId, {
      onSuccess: () => toast({ tone: 'success', title: 'Đã xóa bình luận' }),
      onError: () => toast({ tone: 'error', title: 'Không thể xóa' }),
    });
  }, [deleteMutation, toast]);

  const visibleComments = comments.filter(c => !c.deletedAt || c.authorId === currentUserId || isAdmin);

  return (
    <div className="space-y-2">
      {visibleComments.length === 0 ? (
        <EmptyState variant="inline" title="Chưa có trao đổi nào" description="Hãy bắt đầu cuộc trò chuyện" />
      ) : (
        <div className="divide-y divide-outline-variant/30">
          {visibleComments.map((c) => (
            <CommentItem key={c.id} comment={c} currentUserId={currentUserId} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-outline-variant/30">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Viết bình luận... (Cmd+Enter để gửi)"
          className="flex-1 rounded-input border border-outline-variant bg-surface-container-lowest p-2 text-[length:var(--text-body-sm)] text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none resize-none"
          rows={2}
        />
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!body.trim() || createMutation.isPending} isLoading={createMutation.isPending} iconLeft={<Send />}>Send Comment</Button>
      </div>
    </div>
  );
}

CommentThread.displayName = 'CommentThread';
