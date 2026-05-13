import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Bell, X } from 'lucide-react';
import { EmptyState } from './empty-state';

export interface NotificationCenterNotification {
  id: string;
  /** Title shown in bold. */
  title: string;
  description?: string;
  /** ISO timestamp or any date — shown as relative ("2h ago"). */
  timestamp: Date;
  /** Mark as unread → bold + dot indicator. */
  unread?: boolean;
  /** Optional click handler (e.g., navigate to source). */
  onClick?: () => void;
  /** Optional icon (Lucide or custom). */
  icon?: ReactNode;
  /** Tone hint for icon background. */
  tone?: 'info' | 'success' | 'warning' | 'error';
}

export interface NotificationCenterTriggerProps {
  count?: number;
  onClick: () => void;
  ariaLabel?: string;
}

export interface NotificationCenterPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: NotificationCenterNotification[];
  /** Slot for actions in the panel header (e.g., "Mark all read"). */
  headerActions?: ReactNode;
  /** Empty state slot — defaults to EmptyState with bell icon. */
  empty?: ReactNode;
}

const toneIconBg = {
  info: 'bg-info-container text-on-info-container',
  success: 'bg-success-container text-on-success-container',
  warning: 'bg-warning-container text-on-warning-container',
  error: 'bg-error-container text-on-error-container',
};

function relativeTime(d: Date): string {
  const ms = Date.now() - d.getTime();
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString('vi-VN');
}

/**
 * NotificationCenter — compound API with Trigger + Panel.
 *
 * Usage: render `<NotificationCenter.Trigger>` in Header, `<NotificationCenter.Panel>` controlled by parent.
 * Headless UI Dialog for slide-in (right side), focus trap, ESC.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <NotificationCenter.Trigger count={unread.length} onClick={() => setOpen(true)} />
 * <NotificationCenter.Panel open={open} onClose={() => setOpen(false)} notifications={list} />
 */
function NotificationCenterTrigger({ count = 0, onClick, ariaLabel = 'Open notifications' }: NotificationCenterTriggerProps) {
  return (
    <button
      type="button"
      aria-label={count > 0 ? `${ariaLabel} (${count} unread)` : ariaLabel}
      onClick={onClick}
      className="relative inline-flex size-9 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus-visible:outline-none"
    >
      <Bell className="size-4" aria-hidden="true" />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error"
          aria-hidden="true"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

function NotificationCenterPanel({ open, onClose, notifications, headerActions, empty }: NotificationCenterPanelProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-modal" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="transition-opacity motion-fast ease-standard"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity motion-fast ease-standard"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-on-surface/30 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="transition-transform motion-medium ease-decelerate"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transition-transform motion-fast ease-accelerate"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <DialogPanel className="fixed inset-y-0 right-0 flex w-96 max-w-[90vw] flex-col bg-surface-2 shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-outline-variant/40 px-4">
              <DialogTitle className="font-headline text-[length:var(--text-h6)] font-semibold text-on-surface">
                Notifications
              </DialogTitle>
              <div className="flex items-center gap-2">
                {headerActions}
                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={onClose}
                  className="-mr-1 inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus-visible:outline-none"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                empty ?? (
                  <EmptyState
                    icon={<Bell />}
                    title="All clear"
                    description="No notifications right now."
                    variant="inline"
                  />
                )
              ) : (
                <ul className="flex flex-col">
                  {notifications.map((n) => {
                    const Tag = n.onClick ? 'button' : 'div';
                    return (
                      <li key={n.id} className="border-b border-outline-variant/30 last:border-0">
                        <Tag
                          type={n.onClick ? 'button' : undefined}
                          onClick={n.onClick}
                          className={[
                            'flex w-full items-start gap-3 px-4 py-3 text-left',
                            n.onClick ? 'transition-colors motion-fast ease-standard hover:bg-surface-container-low focus-visible:outline-none focus-visible:bg-surface-container' : '',
                          ].join(' ')}
                        >
                          {n.icon && (
                            <div
                              className={[
                                'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-button [&>svg]:size-4',
                                toneIconBg[n.tone ?? 'info'],
                              ].join(' ')}
                            >
                              {n.icon}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className={[
                                'text-[length:var(--text-body-sm)] leading-snug',
                                n.unread ? 'font-semibold text-on-surface' : 'text-on-surface',
                              ].join(' ')}
                            >
                              {n.title}
                            </p>
                            {n.description && (
                              <p className="mt-0.5 text-[length:var(--text-caption)] text-on-surface-variant leading-snug line-clamp-2">
                                {n.description}
                              </p>
                            )}
                            <span className="mt-1 inline-block text-[length:var(--text-caption)] text-on-surface-variant">
                              {relativeTime(n.timestamp)}
                            </span>
                          </div>
                          {n.unread && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                          )}
                        </Tag>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

NotificationCenterTrigger.displayName = 'NotificationCenter.Trigger';
NotificationCenterPanel.displayName = 'NotificationCenter.Panel';

export const NotificationCenter = {
  Trigger: NotificationCenterTrigger,
  Panel: NotificationCenterPanel,
};
