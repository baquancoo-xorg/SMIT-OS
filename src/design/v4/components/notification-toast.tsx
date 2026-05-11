import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';
import type { FeedbackIntent } from './badge';

export interface ToastProps {
  id: string;
  intent?: FeedbackIntent | 'neutral';
  title?: ReactNode;
  description?: ReactNode;
  /** Auto-dismiss in ms. 0 = manual only. Default 4000. */
  durationMs?: number;
  /** Action button (e.g. "Undo"). */
  action?: ReactNode;
  onDismiss: (id: string) => void;
}

const intentClass: Record<NonNullable<ToastProps['intent']>, string> = {
  success: 'border-success/40',
  warning: 'border-warning/40',
  error:   'border-error/40',
  info:    'border-info/40',
  neutral: 'border-outline-subtle',
};

const accentDot: Record<NonNullable<ToastProps['intent']>, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error:   'bg-error',
  info:    'bg-info',
  neutral: 'bg-fg-faint',
};

/**
 * v4 NotificationToast — single toast bubble. Auto-dismisses after `durationMs`.
 * Usually rendered by NotificationCenter, not directly.
 */
export function NotificationToast({ id, intent = 'neutral', title, description, durationMs = 4000, action, onDismiss }: ToastProps) {
  useEffect(() => {
    if (durationMs === 0) return;
    const timer = window.setTimeout(() => onDismiss(id), durationMs);
    return () => window.clearTimeout(timer);
  }, [id, durationMs, onDismiss]);

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-snug rounded-card border bg-surface-popover px-cozy py-snug shadow-elevated',
        'min-w-[280px] max-w-snug pointer-events-auto backdrop-blur-md',
        intentClass[intent],
      )}
    >
      <span aria-hidden="true" className={cn('mt-tight size-2 shrink-0 rounded-pill', accentDot[intent])} />
      <div className="flex-1 min-w-0">
        {title && <p className="text-body-sm font-semibold text-fg truncate">{title}</p>}
        {description && <p className="text-caption text-fg-muted">{description}</p>}
        {action && <div className="mt-tight">{action}</div>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="text-fg-subtle hover:text-fg transition-colors duration-fast"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
