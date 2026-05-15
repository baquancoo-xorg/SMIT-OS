import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastTone = 'success' | 'warning' | 'error' | 'info';

export interface ToastOptions {
  id?: string;
  tone?: ToastTone;
  title: string;
  description?: string;
  /** Auto-dismiss after this many ms. 0 = persistent (manual close only). Default: 4000. */
  durationMs?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastInternal extends Required<Pick<ToastOptions, 'id' | 'tone' | 'title' | 'durationMs'>> {
  description?: string;
  action?: ToastOptions['action'];
}

const toneIcon: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 aria-hidden="true" />,
  warning: <AlertTriangle aria-hidden="true" />,
  error: <AlertCircle aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
};

const toneStyle: Record<ToastTone, string> = {
  success: 'border-success/30 bg-success-container text-on-success-container [&_.toast-icon]:text-success',
  warning: 'border-warning/30 bg-warning-container text-on-warning-container [&_.toast-icon]:text-warning',
  error: 'border-error/30 bg-error-container text-on-error-container [&_.toast-icon]:text-error',
  info: 'border-info/30 bg-info-container text-on-info-container [&_.toast-icon]:text-info',
};

interface ToastContextValue {
  toast: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;
const genId = () => `toast-${++idCounter}-${Date.now()}`;

/**
 * NotificationToast / ToastProvider — opinionated toast system.
 *
 * Wrap app once with `<ToastProvider>`, then call `useToast().toast({ ... })` anywhere.
 * Auto-dismiss with timer, manual dismiss with `dismiss(id)` or close button.
 * Stacked top-right by default; respects `z-toast` token.
 *
 * @example
 * // App root:
 * <ToastProvider><App /></ToastProvider>
 *
 * // Anywhere downstream:
 * const { toast } = useToast();
 * toast({ tone: 'success', title: 'Saved!' });
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (opts: ToastOptions): string => {
      const id = opts.id ?? genId();
      const internal: ToastInternal = {
        id,
        tone: opts.tone ?? 'info',
        title: opts.title,
        description: opts.description,
        durationMs: opts.durationMs ?? 4000,
        action: opts.action,
      };
      setToasts((prev) => [...prev, internal]);

      if (internal.durationMs > 0) {
        const timer = window.setTimeout(() => dismiss(id), internal.durationMs);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  const clear = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
    setToasts([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss, clear }}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}

function ToastViewport({ toasts, dismiss }: { toasts: ToastInternal[]; dismiss: (id: string) => void }) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-0 z-toast flex flex-col items-end gap-2 p-4 sm:p-6"
    >
      <div className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <NotificationToast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </div>
  );
}

interface NotificationToastProps {
  toast: ToastInternal;
  onDismiss: () => void;
}

/** Single visual toast row — usually rendered by ToastViewport, but exported for custom layouts. */
export function NotificationToast({ toast, onDismiss }: NotificationToastProps) {
  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
      className={[
        'pointer-events-auto flex w-full items-start gap-3 rounded-card border p-3 shadow-md backdrop-blur-md',
        'toast-enter',
        toneStyle[toast.tone],
      ].join(' ')}
    >
      <span className="toast-icon mt-0.5 [&>svg]:size-5">{toneIcon[toast.tone]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[length:var(--text-body-sm)] font-semibold leading-snug">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-[length:var(--text-caption)] opacity-90 leading-snug">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action!.onClick();
              onDismiss();
            }}
            className="mt-2 text-[length:var(--text-caption)] font-semibold underline-offset-2 hover:underline focus-visible:outline-none"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-mt-0.5 -mr-1 inline-flex size-6 shrink-0 items-center justify-center rounded-button hover:bg-current/10 focus-visible:outline-none"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
