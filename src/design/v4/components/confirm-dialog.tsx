import type { ReactNode } from 'react';
import { Modal } from './modal';
import { Button } from './button';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  /** Body content — usually a short prompt. */
  message: ReactNode;
  /** Confirm button label. Default "Confirm". */
  confirmLabel?: ReactNode;
  /** Cancel button label. Default "Cancel". */
  cancelLabel?: ReactNode;
  /** Mark as destructive action (uses red Button variant). Default false. */
  destructive?: boolean;
  /** Disable confirm (e.g. while server work in flight). */
  busy?: boolean;
}

/**
 * v4 ConfirmDialog — small Modal preset for yes/no decisions.
 *
 * @example
 *   <ConfirmDialog
 *     open={open}
 *     onClose={close}
 *     onConfirm={destroy}
 *     destructive
 *     title="Delete lead?"
 *     message="This action cannot be undone."
 *   />
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  busy = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      hideCloseButton
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>{cancelLabel}</Button>
          <Button
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-body text-fg-muted">{message}</p>
    </Modal>
  );
}
