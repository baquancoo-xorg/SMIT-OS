import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';
import { useEscapeKey } from '../primitives/use-escape-key';
import { useFocusTrap } from '../primitives/use-focus-trap';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  /** Header title node (rendered as h2 inside modal). */
  title?: ReactNode;
  /** Optional subtitle below title. */
  description?: ReactNode;
  /** Footer action slot (right-aligned). */
  footer?: ReactNode;
  /** Close on overlay click. Default true. */
  closeOnOverlay?: boolean;
  /** Close on Escape. Default true. */
  closeOnEscape?: boolean;
  /** Hide the X close button in the header. Default false. */
  hideCloseButton?: boolean;
  children: ReactNode;
}

const sizeClass: Record<ModalSize, string> = {
  sm: 'max-w-cozy',
  md: 'max-w-wide',
  lg: 'max-w-vast',
  full: 'max-w-[min(96vw,1400px)]',
};

/**
 * v4 Modal — portal + focus trap + escape + scroll lock + overlay click.
 *
 * @example
 *   <Modal open={open} onClose={close} title="Confirm" footer={<Button>OK</Button>}>
 *     <p>Are you sure?</p>
 *   </Modal>
 */
export function Modal({
  open,
  onClose,
  size = 'md',
  title,
  description,
  footer,
  closeOnOverlay = true,
  closeOnEscape = true,
  hideCloseButton = false,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEscapeKey(onClose, open && closeOnEscape);
  useFocusTrap(dialogRef, open);

  // Scroll lock on body while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-comfy"
      role="presentation"
      onClick={(e) => {
        if (closeOnOverlay && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => closeOnOverlay && onClose()}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-desc' : undefined}
        className={cn(
          'relative w-full bg-surface-popover border border-outline-subtle',
          'rounded-modal shadow-modal',
          'flex flex-col max-h-[min(90vh,800px)]',
          sizeClass[size],
        )}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-cozy px-comfy pt-comfy pb-cozy border-b border-outline-subtle">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 id="modal-title" className="text-h5 font-semibold tracking-tight text-fg">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-desc" className="mt-tight text-body-sm text-fg-muted">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-pill',
                  'text-fg-muted hover:text-fg hover:bg-surface-overlay',
                  'transition-colors duration-fast',
                )}
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-comfy py-comfy">{children}</div>
        {footer && (
          <div className="flex justify-end gap-snug px-comfy py-cozy border-t border-outline-subtle">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
