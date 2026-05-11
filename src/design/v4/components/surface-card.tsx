import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type CardElevation = 'flat' | 'raised' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardRadius = 'card' | 'callout';

export interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: CardElevation;
  padding?: CardPadding;
  radius?: CardRadius;
  /** Lift on hover with stronger shadow + border. Default false. */
  interactive?: boolean;
  /** Apply warm orange-tinted surface (--color-surface-warm). Used for accent callouts. */
  warm?: boolean;
  children: ReactNode;
}

const paddingClass: Record<CardPadding, string> = {
  none: '',
  sm: 'p-md',
  md: 'p-lg',
  lg: 'p-xl',
};

const elevationClass: Record<CardElevation, string> = {
  flat: 'shadow-none',
  raised: 'shadow-card',
  elevated: 'shadow-elevated',
};

/**
 * v4 SurfaceCard — replaces v3 glass-card. Dark elevated surface with subtle border.
 *
 * @example
 *   <SurfaceCard elevation="raised" padding="md">
 *     <h3>KPI</h3>
 *     <p>$19,270.56</p>
 *   </SurfaceCard>
 *
 *   <SurfaceCard warm radius="callout" padding="lg">Upgrade to Pro!</SurfaceCard>
 */
export const SurfaceCard = forwardRef<HTMLDivElement, SurfaceCardProps>(function SurfaceCard(
  {
    elevation = 'raised',
    padding = 'md',
    radius = 'card',
    interactive = false,
    warm = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'border border-outline-subtle',
        warm ? 'bg-surface-warm' : 'bg-surface-elevated',
        radius === 'card' ? 'rounded-card' : 'rounded-callout',
        paddingClass[padding],
        elevationClass[elevation],
        interactive &&
          'transition-[border-color,box-shadow,transform] duration-medium ease-standard ' +
            'hover:border-outline hover:shadow-elevated hover:-translate-y-px',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
