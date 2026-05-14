import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon shown above the title (Lucide or custom). Sized to 48px. */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Action slot — usually a primary Button. */
  actions?: ReactNode;
  /** Adds a soft decorative blob behind the icon (Bento signature). */
  decorative?: boolean;
  /** `card` wraps in glass-card container; `inline` is unwrapped (use inside other containers). */
  variant?: 'card' | 'inline';
}

/**
 * EmptyState v2 — placeholder shown when a list/table/page has no data.
 *
 * Pattern from Phase 1 audit: empty states had 5 different variants across pages.
 * This is the canonical one. Use `decorative` for primary empty states (page-level),
 * skip for inline (table cells, side panels).
 *
 * @example
 * <EmptyState
 *   icon={<Inbox />}
 *   title="No leads yet"
 *   description="Connect your CRM to start tracking leads."
 *   actions={<Button>Connect CRM</Button>}
 *   decorative
 * />
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      actions,
      decorative = false,
      variant = 'card',
      className = '',
      ...props
    },
    ref,
  ) => {
    const isCard = variant === 'card';

    return (
      <div
        ref={ref}
        role="status"
        className={[
          'relative flex flex-col items-center justify-center text-center gap-4 py-12 px-6',
          isCard ? 'rounded-card border border-outline-variant/40 bg-surface shadow-card' : '',
          'overflow-hidden',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {decorative && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -z-10 size-48 rounded-full bg-primary-container/40 blur-3xl"
            style={{ top: '20%', left: '50%', transform: 'translateX(-50%)' }}
          />
        )}

        {icon && (
          <div className="flex size-16 items-center justify-center rounded-full bg-surface-container text-on-surface-variant [&>svg]:size-7">
            {icon}
          </div>
        )}

        <div className="flex flex-col gap-1.5 max-w-sm">
          <h3 className="font-headline text-[length:var(--text-h6)] font-semibold text-on-surface">
            {title}
          </h3>
          {description && (
            <p className="text-[length:var(--text-body-sm)] text-on-surface-variant leading-snug">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {actions}
          </div>
        )}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';
