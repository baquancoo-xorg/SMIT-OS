import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

export type GlassCardVariant = 'surface' | 'raised' | 'ghost' | 'outlined';
export type GlassCardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant;
  padding?: GlassCardPadding;
  /** When true, adds subtle hover lift (use only for interactive cards). */
  interactive?: boolean;
  /** Optional decorative blob (Bento). Disabled by default — opt-in for hero cards. */
  decorative?: boolean;
  decorativeAccent?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** ARIA region label when card represents a landmark. */
  ariaLabel?: string;
  children?: ReactNode;
}

const variantStyles: Record<GlassCardVariant, string> = {
  surface: 'bg-white/70 backdrop-blur-md border border-white/30 shadow-sm',
  raised: 'bg-white/85 backdrop-blur-md border border-white/40 shadow-md',
  ghost: 'bg-transparent border border-outline-variant/40',
  outlined: 'bg-surface-container-lowest border border-outline-variant',
};

const paddingStyles: Record<GlassCardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6 md:p-8',
};

const blobAccent = {
  primary: 'bg-primary-container/40',
  success: 'bg-success-container/40',
  warning: 'bg-warning-container/40',
  error: 'bg-error-container/40',
  info: 'bg-info-container/40',
};

/**
 * GlassCard v2 — canonical glass-morphism container.
 *
 * Phase 1 audit found 30+ ad-hoc glass usages across 8 pages with inconsistent variants.
 * This is the single source of truth: 4 variants × 4 padding presets.
 *
 * @example
 * <GlassCard variant="raised" padding="md">
 *   <h2>Recent Activity</h2>
 *   ...
 * </GlassCard>
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = 'surface',
      padding = 'md',
      interactive = false,
      decorative = false,
      decorativeAccent = 'primary',
      ariaLabel,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role={ariaLabel ? 'region' : undefined}
        aria-label={ariaLabel}
        className={[
          'relative overflow-hidden rounded-card',
          variantStyles[variant],
          paddingStyles[padding],
          interactive
            ? 'transition-all motion-medium ease-standard hover:shadow-md hover:border-outline-variant/70 cursor-pointer'
            : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {decorative && (
          <div
            aria-hidden="true"
            className={[
              'pointer-events-none absolute -top-16 -right-16 size-48 rounded-full blur-3xl opacity-60',
              blobAccent[decorativeAccent],
            ].join(' ')}
          />
        )}
        <div className="relative">{children}</div>
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';
