import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop, Transition, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  /** Hide the default close (X) button. Use when modal is non-dismissible (rare). */
  hideCloseButton?: boolean;
  /** When false, ESC + outside click do not close. Default: true. */
  dismissible?: boolean;
  size?: ModalSize;
  /** Footer slot — typically Button group. */
  footer?: ReactNode;
  children?: ReactNode;
  /** Optional icon shown left of the title. */
  icon?: ReactNode;
  /** Optional accent color for icon background. */
  iconAccent?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  fullscreen: 'max-w-full h-full max-h-none rounded-none',
};

const iconAccentStyle = {
  primary: 'bg-primary-container text-on-primary-container',
  success: 'bg-success-container text-on-success-container',
  warning: 'bg-warning-container text-on-warning-container',
  error: 'bg-error-container text-on-error-container',
  info: 'bg-info-container text-on-info-container',
};

/**
 * Modal v2 — Headless UI Dialog wrapper.
 *
 * Uses portal (Headless UI auto), focus trap, ESC dismiss, scroll lock.
 * Lazy mount: panel only renders when `open=true` (Transition handles enter/leave anim).
 *
 * @example
 * <Modal open={open} onClose={close} title="Edit Objective" size="md" footer={<><Button variant="ghost">Cancel</Button><Button>Save</Button></>}>
 *   <form>...</form>
 * </Modal>
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  hideCloseButton = false,
  dismissible = true,
  size = 'md',
  footer,
  children,
  icon,
  iconAccent = 'primary',
}: ModalProps) {
  const handleClose = dismissible ? onClose : () => undefined;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-modal" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out motion-medium"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in motion-fast"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8">
          <TransitionChild
            as={Fragment}
            enter="ease-out motion-medium"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in motion-fast"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              className={[
                'flex w-full max-h-[calc(100dvh-2rem)] transform flex-col overflow-hidden rounded-modal bg-surface shadow-elevated transition-all sm:max-h-[calc(100dvh-3rem)] lg:max-h-[calc(100dvh-4rem)]',
                sizeStyles[size],
              ].join(' ')}
            >
              {(title || icon || !hideCloseButton) && (
                <div className="flex items-start gap-3 border-b border-outline-variant/40 p-5">
                  {icon && (
                    <div
                      className={[
                        'flex size-10 shrink-0 items-center justify-center rounded-card [&>svg]:size-5',
                        iconAccentStyle[iconAccent],
                      ].join(' ')}
                    >
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {title && (
                      <DialogTitle className="font-headline text-[length:var(--text-h5)] font-semibold text-on-surface">
                        {title}
                      </DialogTitle>
                    )}
                    {description && (
                      <p className="mt-1 text-[length:var(--text-body-sm)] text-on-surface-variant">
                        {description}
                      </p>
                    )}
                  </div>
                  {!hideCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close dialog"
                      className="-m-1 inline-flex size-8 shrink-0 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus-visible:outline-none"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

              {footer && (
                <div className="shrink-0 border-t border-outline-variant/40 bg-surface-container-low/50 p-4">
                  {footer}
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

Modal.displayName = 'Modal';
