import type { FormEvent, ReactNode } from 'react';
import { Modal } from './modal';
import type { ModalSize } from './modal';
import { Button } from './button';
import type { ButtonVariant } from './button';

export interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called on form submit. Wrap async work in await — `isSubmitting` should be controlled by caller. */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
  title: string;
  description?: string;
  icon?: ReactNode;
  iconAccent?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: ModalSize;
  /** Submit button label. Default: "Save". */
  submitLabel?: string;
  /** Submit button variant. Default: 'primary'. */
  submitVariant?: ButtonVariant;
  cancelLabel?: string;
  /** Caller-controlled submit state — disables submit + shows spinner when true. */
  isSubmitting?: boolean;
  /** Disable submit button (validation failed). */
  submitDisabled?: boolean;
  /** Hide cancel button (rare — use for non-cancellable wizards). */
  hideCancel?: boolean;
  /** Form fields go here. */
  children?: ReactNode;
  /** Optional extra footer content rendered LEFT of buttons (e.g., "Required" notice). */
  footerLeft?: ReactNode;
}

/**
 * FormDialog v2 — Modal + native HTML form composition.
 *
 * Wraps `children` in a `<form>` so submit-on-Enter works out of the box.
 * Provides Cancel + Submit buttons. Caller manages form state + validation
 * (Zod, react-hook-form, or controlled inputs — all work).
 *
 * @example
 * <FormDialog
 *   open={open}
 *   onClose={close}
 *   onSubmit={async (e) => { e.preventDefault(); await save(); close(); }}
 *   title="New Objective"
 *   icon={<Target />}
 *   isSubmitting={pending}
 * >
 *   <Input label="Title" name="title" required />
 *   <Input label="Target" type="number" name="target" required />
 * </FormDialog>
 */
export function FormDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  icon,
  iconAccent = 'primary',
  size = 'md',
  submitLabel = 'Save',
  submitVariant = 'primary',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  submitDisabled = false,
  hideCancel = false,
  children,
  footerLeft,
}: FormDialogProps) {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || submitDisabled) return;
    await onSubmit(e);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon={icon}
      iconAccent={iconAccent}
      size={size}
      dismissible={!isSubmitting}
      hideCloseButton={isSubmitting}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <div className="text-[length:var(--text-caption)] text-on-surface-variant">{footerLeft}</div>
          <div className="flex items-center gap-2">
            {!hideCancel && (
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                {cancelLabel}
              </Button>
            )}
            <Button
              type="submit"
              form="form-dialog-form"
              variant={submitVariant}
              disabled={submitDisabled}
              isLoading={isSubmitting}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      }
    >
      <form id="form-dialog-form" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-4">{children}</div>
      </form>
    </Modal>
  );
}

FormDialog.displayName = 'FormDialog';
