import { useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, Trash2, AlertCircle } from 'lucide-react';
import { Modal } from './modal';
import { Button } from './button';
import { Input } from './input';

export type ConfirmTone = 'destructive' | 'warning' | 'info';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  /** Tone of the action — destructive (delete), warning, or info. */
  tone?: ConfirmTone;
  /** Confirm button label. Default: "Confirm" / "Delete" / "Continue" by tone. */
  confirmLabel?: string;
  cancelLabel?: string;
  /** When set, user must type this string to enable Confirm. Use for irreversible deletes. */
  typeToConfirm?: string;
  /** Loading state during async onConfirm. */
  isLoading?: boolean;
}

const toneConfig: Record<ConfirmTone, { icon: ReactNode; iconAccent: 'error' | 'warning' | 'info'; defaultLabel: string; confirmVariant: 'destructive' | 'primary' }> = {
  destructive: { icon: <Trash2 />, iconAccent: 'error', defaultLabel: 'Delete', confirmVariant: 'destructive' },
  warning: { icon: <AlertTriangle />, iconAccent: 'warning', defaultLabel: 'Continue', confirmVariant: 'primary' },
  info: { icon: <AlertCircle />, iconAccent: 'info', defaultLabel: 'Confirm', confirmVariant: 'primary' },
};

/**
 * ConfirmDialog v2 — opinionated Modal preset for binary confirms.
 *
 * Three tones: destructive (delete), warning (irreversible non-delete), info (acknowledge).
 * Optional `typeToConfirm` for high-stakes actions (delete OKR, remove integration, etc.).
 *
 * @example
 * <ConfirmDialog
 *   open={open}
 *   onClose={close}
 *   onConfirm={handleDelete}
 *   tone="destructive"
 *   title="Delete Objective?"
 *   description={<>This will permanently delete <strong>Q2 Revenue Goal</strong>.</>}
 *   typeToConfirm="DELETE"
 * />
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  tone = 'info',
  confirmLabel,
  cancelLabel = 'Cancel',
  typeToConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const config = toneConfig[tone];
  const [typed, setTyped] = useState('');

  const confirmDisabled = isLoading || (typeToConfirm !== undefined && typed !== typeToConfirm);

  const handleConfirm = async () => {
    await onConfirm();
    setTyped('');
  };

  const handleClose = () => {
    setTyped('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      icon={config.icon}
      iconAccent={config.iconAccent}
      size="sm"
      dismissible={!isLoading}
      hideCloseButton={isLoading}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={confirmDisabled}
            isLoading={isLoading}
          >
            {confirmLabel ?? config.defaultLabel}
          </Button>
        </>
      }
    >
      {description && (
        <div className="text-[length:var(--text-body-sm)] text-on-surface-variant leading-snug">
          {description}
        </div>
      )}

      {typeToConfirm !== undefined && (
        <div className="mt-4">
          <Input
            label={`Type "${typeToConfirm}" to confirm`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={typeToConfirm}
            autoComplete="off"
            autoFocus
          />
        </div>
      )}
    </Modal>
  );
}

ConfirmDialog.displayName = 'ConfirmDialog';
