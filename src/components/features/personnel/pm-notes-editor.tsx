/**
 * PM notes editor. Admin write; admin + self read.
 */

import { useState } from 'react';
import { Trash2, Save, Plus, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button, Card, useToast } from '../../ui';
import {
  usePmNotesQuery,
  useCreatePmNoteMutation,
  useUpdatePmNoteMutation,
  useDeletePmNoteMutation,
} from '../../../hooks/use-pm-notes';
import { currentQuarter, quarterLabel } from '../../../lib/personnel/quarter-utils';

interface Props {
  personnelId: string;
}

export function PmNotesEditor({ personnelId }: Props) {
  const { currentUser } = useAuth();
  const isAdmin = !!currentUser?.isAdmin;
  const { toast } = useToast();
  const { data: notes, isLoading } = usePmNotesQuery(personnelId);
  const create = useCreatePmNoteMutation(personnelId);
  const update = useUpdatePmNoteMutation(personnelId);
  const del = useDeletePmNoteMutation(personnelId);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftQuarter, setDraftQuarter] = useState(currentQuarter());
  const [draftContent, setDraftContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  function submitDraft() {
    if (!draftContent.trim()) return;
    create.mutate(
      { quarter: draftQuarter, content: draftContent },
      {
        onSuccess: () => {
          setDraftContent('');
          setDraftOpen(false);
          toast({ tone: 'success', title: 'Đã lưu ghi chú' });
        },
        onError: (e: Error) => toast({ tone: 'error', title: 'Lưu thất bại', description: e.message }),
      },
    );
  }

  function submitEdit() {
    if (!editingId || !editingContent.trim()) return;
    update.mutate(
      { noteId: editingId, content: editingContent },
      {
        onSuccess: () => {
          setEditingId(null);
          toast({ tone: 'success', title: 'Đã cập nhật' });
        },
      },
    );
  }

  function handleDelete(id: string) {
    if (!window.confirm('Xoá ghi chú này?')) return;
    del.mutate(id, { onSuccess: () => toast({ tone: 'success', title: 'Đã xoá' }) });
  }

  if (isLoading) return <div className="h-64 animate-pulse rounded-card bg-surface-2" />;

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">PM Notes</p>
          <h3 className="mt-1 font-headline text-lg font-black text-text-1">Ghi chú coaching theo quý</h3>
        </div>
        {isAdmin && !draftOpen && (
          <Button variant="primary" iconLeft={<Plus />} size="sm" onClick={() => setDraftOpen(true)}>
            Thêm ghi chú
          </Button>
        )}
      </div>

      {draftOpen && (
        <div className="mt-4 flex flex-col gap-2 rounded-card border border-border bg-surface-2 p-3">
          <div className="flex items-center gap-2">
            <input
              value={draftQuarter}
              onChange={(e) => setDraftQuarter(e.target.value)}
              className="h-9 w-24 rounded-input border border-border bg-surface px-2 text-sm text-text-1"
              placeholder="2026-Q2"
            />
            <span className="text-xs text-text-muted">Format YYYY-QN</span>
          </div>
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            rows={4}
            placeholder="Coaching point, observations, action items..."
            className="w-full rounded-input border border-border bg-surface p-3 text-sm text-text-1 focus-visible:outline-none focus-visible:border-accent"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" iconLeft={<X />} onClick={() => { setDraftOpen(false); setDraftContent(''); }}>Huỷ</Button>
            <Button variant="primary" size="sm" iconLeft={<Save />} onClick={submitDraft} disabled={create.isPending}>
              {create.isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>
      )}

      {(notes?.length ?? 0) === 0 ? (
        <p className="mt-4 text-sm text-text-2">Chưa có ghi chú nào.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes!.map((n) => (
            <li key={n.id} className="rounded-card border border-border bg-surface p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">{quarterLabel(n.quarter)}</p>
                  <p className="mt-1 text-xs text-text-2">
                    bởi <strong className="text-text-1">{n.author.fullName}</strong> · {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => { setEditingId(n.id); setEditingContent(n.content); }}
                      className="rounded-button border border-border bg-surface px-2 py-1 text-[10px] text-text-2 hover:text-text-1"
                    >Sửa</button>
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      className="inline-flex items-center gap-1 rounded-button border border-error/30 bg-surface px-2 py-1 text-[10px] text-error hover:bg-error/10"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )}
              </div>
              {editingId === n.id ? (
                <div className="mt-2 flex flex-col gap-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={4}
                    className="w-full rounded-input border border-border bg-surface-2 p-2 text-sm text-text-1"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>Huỷ</Button>
                    <Button variant="primary" size="sm" onClick={submitEdit} disabled={update.isPending}>Lưu</Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-sm text-text-1">{n.content}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
