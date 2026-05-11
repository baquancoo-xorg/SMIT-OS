import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { NotificationToast, type ToastProps } from './notification-toast';

export interface ToastInput {
  intent?: ToastProps['intent'];
  title?: ReactNode;
  description?: ReactNode;
  durationMs?: number;
  action?: ReactNode;
}

interface ToastState extends ToastInput {
  id: string;
}

interface ContextValue {
  toasts: ToastState[];
  push: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const NotificationContext = createContext<ContextValue | null>(null);

/** Hook to push/dismiss toasts. Throws if used outside `<NotificationProvider>`. */
export function useNotifications(): ContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
}

export interface NotificationProviderProps {
  children: ReactNode;
  /** Maximum visible toasts. Older ones drop off. Default 5. */
  max?: number;
}

let counter = 0;
const nextId = (): string => `t${++counter}-${Date.now().toString(36)}`;

/**
 * v4 NotificationCenter / Provider — top-right toast stack with portal.
 * Wrap the app root with `<NotificationProvider>` and call `useNotifications().push(...)` anywhere.
 */
export function NotificationProvider({ children, max = 5 }: NotificationProviderProps) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (input: ToastInput): string => {
      const id = nextId();
      setToasts((curr) => [...curr.slice(-(max - 1)), { ...input, id }]);
      return id;
    },
    [max],
  );

  const clear = useCallback(() => setToasts([]), []);

  const value = useMemo<ContextValue>(() => ({ toasts, push, dismiss, clear }), [toasts, push, dismiss, clear]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-live="polite"
            aria-atomic="false"
            className="fixed top-lg right-lg z-toast flex flex-col gap-sm pointer-events-none"
          >
            {toasts.map((t) => (
              <NotificationToast key={t.id} {...t} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )}
    </NotificationContext.Provider>
  );
}
