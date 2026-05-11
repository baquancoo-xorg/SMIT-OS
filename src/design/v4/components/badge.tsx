import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Task lifecycle states (10) from Image 2 reference. */
export type TaskStatus =
  | 'in-progress'
  | 'to-do'
  | 'in-review'
  | 'design-review'
  | 'rework'
  | 'done'
  | 'not-started'
  | 'blocked'
  | 'on-hold'
  | 'archived';

/** Generic feedback intents (4) — retained from v3 for cross-domain reuse. */
export type FeedbackIntent = 'success' | 'warning' | 'error' | 'info';

/** Neutral chip — no state color. */
export type NeutralIntent = 'neutral';

export type BadgeIntent = TaskStatus | FeedbackIntent | NeutralIntent;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  intent?: BadgeIntent;
  /** Optional dot before the label. Default true. */
  withDot?: boolean;
  /** Optional icon before the label (overrides dot). */
  icon?: ReactNode;
  /** Show subtle glow halo around the pill. Default true. */
  glow?: boolean;
  children: ReactNode;
}

const STATUS_CLASS: Record<Exclude<BadgeIntent, 'neutral'>, string> = {
  // 10 task states
  'in-progress':   'bg-in-progress-soft text-in-progress border-in-progress/40',
  'to-do':         'bg-to-do-soft text-to-do border-to-do/40',
  'in-review':     'bg-in-review-soft text-in-review border-in-review/40',
  'design-review': 'bg-design-review-soft text-design-review border-design-review/40',
  rework:          'bg-rework-soft text-rework border-rework/40',
  done:            'bg-done-soft text-done border-done/40',
  'not-started':   'bg-not-started-soft text-not-started border-not-started/40',
  blocked:         'bg-blocked-soft text-blocked border-blocked/40',
  'on-hold':       'bg-on-hold-soft text-on-hold border-on-hold/40',
  archived:        'bg-archived-soft text-archived border-archived/40',
  // 4 feedback intents
  success: 'bg-success-soft text-success border-success/40',
  warning: 'bg-warning-soft text-warning border-warning/40',
  error:   'bg-error-soft text-error border-error/40',
  info:    'bg-info-soft text-info border-info/40',
};

const NEUTRAL_CLASS = 'bg-surface-overlay text-fg-muted border-outline-subtle';

/**
 * v4 Badge — glassmorphic status pill with optional glow halo.
 * Supports 10 task states, 4 feedback intents, plus `neutral`.
 *
 * @example
 *   <Badge intent="done">Completed</Badge>
 *   <Badge intent="blocked" icon={<XIcon />}>Blocked</Badge>
 *   <Badge intent="neutral" withDot={false}>v1.2.3</Badge>
 */
export function Badge({
  intent = 'neutral',
  withDot = true,
  icon,
  glow = true,
  className,
  children,
  ...rest
}: BadgeProps) {
  const intentClass = intent === 'neutral' ? NEUTRAL_CLASS : STATUS_CLASS[intent];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-xs px-sm py-xs',
        'rounded-pill border text-label font-medium leading-tight',
        'backdrop-blur-[8px]',
        intentClass,
        glow && intent !== 'neutral' && 'shadow-[0_0_16px_-2px_currentColor]',
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {icon}
        </span>
      ) : (
        withDot && (
          <span
            aria-hidden="true"
            className="size-1.5 rounded-pill bg-current shadow-[0_0_6px_currentColor]"
          />
        )
      )}
      <span>{children}</span>
    </span>
  );
}
