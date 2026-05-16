import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '../../ui/button';
import type { CommentItem as CommentItemType } from '../../../hooks/use-daily-report-comments';

interface CommentItemProps {
  comment: CommentItemType;
  currentUserId: string;
  isAdmin: boolean;
  onEdit: (commentId: string, body: string) => void;
  onDelete: (commentId: string) => void;
}

export function CommentItem({ comment, currentUserId, isAdmin, onEdit, onDelete }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const isAuthor = comment.authorId === currentUserId;
  const canModify = isAuthor || isAdmin;
  const isDeleted = !!comment.deletedAt;

  const handleSave = () => {
    if (editBody.trim()) {
      onEdit(comment.id, editBody.trim());
      setEditing(false);
    }
  };

  if (isDeleted) {
    return (
      <div className="py-3 text-[length:var(--text-body-sm)] text-on-surface-variant/60 italic">
        [Bình luận đã bị xóa]
      </div>
    );
  }

  return (
    <div className="group flex gap-3 py-3">
      <div className="size-8 shrink-0 rounded-full bg-surface-container-high flex items-center justify-center text-[length:var(--text-caption)] font-semibold text-on-surface-variant">
        {comment.authorName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[length:var(--text-body-sm)]">
          <span className="font-semibold text-on-surface">{comment.authorName}</span>
          <span className="text-on-surface-variant">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
          </span>
          {comment.editedAt && <span className="text-on-surface-variant/60">(đã sửa)</span>}
        </div>

        {editing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="w-full rounded-input border border-outline-variant bg-surface-container-lowest p-2 text-[length:var(--text-body-sm)] text-on-surface focus:border-primary focus:outline-none"
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={handleSave} iconLeft={<Check />}>Save Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditBody(comment.body); }} iconLeft={<X />}>Hủy</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 whitespace-pre-wrap text-[length:var(--text-body-sm)] text-on-surface">{comment.body}</p>
            {canModify && (
              <div className="mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" onClick={() => setEditing(true)} className="p-1 text-on-surface-variant hover:text-on-surface" aria-label="Sửa">
                  <Pencil className="size-3.5" />
                </button>
                <button type="button" onClick={() => onDelete(comment.id)} className="p-1 text-on-surface-variant hover:text-error" aria-label="Xóa">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

CommentItem.displayName = 'CommentItem';
