import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-[var(--density-space)]',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ glow = false, padding = 'md', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-card border border-border bg-surface shadow-card transition-all duration-medium ease-standard',
        glow && 'hover:border-accent/25 hover:shadow-glass',
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = 'Card';
