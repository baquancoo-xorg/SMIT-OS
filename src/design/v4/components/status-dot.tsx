import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import type { TaskStatus, FeedbackIntent } from './badge';

export type StatusDotIntent = TaskStatus | FeedbackIntent | 'neutral';

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  intent?: StatusDotIntent;
  /** Apply glow halo around the dot. Default true. */
  glow?: boolean;
  size?: 'sm' | 'md';
}

const STATUS_BG: Record<Exclude<StatusDotIntent, 'neutral'>, string> = {
  'in-progress':   'bg-in-progress',
  'to-do':         'bg-to-do',
  'in-review':     'bg-in-review',
  'design-review': 'bg-design-review',
  rework:          'bg-rework',
  done:            'bg-done',
  'not-started':   'bg-not-started',
  blocked:         'bg-blocked',
  'on-hold':       'bg-on-hold',
  archived:        'bg-archived',
  success: 'bg-success',
  warning: 'bg-warning',
  error:   'bg-error',
  info:    'bg-info',
};

/**
 * v4 StatusDot — small colored dot, used inline next to labels in tables, list items, etc.
 */
export function StatusDot({ intent = 'neutral', glow = true, size = 'md', className, ...rest }: StatusDotProps) {
  const bg = intent === 'neutral' ? 'bg-fg-faint' : STATUS_BG[intent];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block rounded-pill shrink-0',
        size === 'sm' ? 'size-1.5' : 'size-2',
        bg,
        glow && 'shadow-[0_0_6px_currentColor]',
        className,
      )}
      {...rest}
    />
  );
}
