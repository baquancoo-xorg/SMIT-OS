import { type FormEvent, type ReactNode } from 'react';
import { Modal, type ModalSize } from './modal';
import { Button } from './button';

export interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called on form submit. Prevent default is handled internally. */
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Submit button label. Default "Save". */
  submitLabel?: ReactNode;
  /** Cancel button label. Default "Cancel". */
  cancelLabel?: ReactNode;
  /** Mark submit button as destructive (uses Button variant="destructive"). */
  destructive?: boolean;
  /** Disable submit (e.g. while validating). */
  submitDisabled?: boolean;
  /** Mark submit button as busy. */
  submitBusy?: boolean;
  size?: ModalSize;
  children: ReactNode;
}

/**
 * v4 FormDialog — Modal preset with `<form>` + Cancel / Submit footer wired to onSubmit.
 *
 * @example
 *   <FormDialog open={open} onClose={close} onSubmit={save} title="Edit Lead">
 *     <Input label="Name" required />
 *   </FormDialog>
 */
export function FormDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  destructive = false,
  submitDisabled,
  submitBusy,
  size = 'md',
  children,
}: FormDialogProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size={size}
      title={title}
      description={description}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>{cancelLabel}</Button>
          <Button
            type="submit"
            form="form-dialog-form"
            variant={destructive ? 'destructive' : 'primary'}
            disabled={submitDisabled || submitBusy}
          >
            {submitBusy ? 'Saving…' : submitLabel}
          </Button>
        </>
      }
    >
      <form id="form-dialog-form" onSubmit={handleSubmit} className="flex flex-col gap-md">
        {children}
      </form>
    </Modal>
  );
}
