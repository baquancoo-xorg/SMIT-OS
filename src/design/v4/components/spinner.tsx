import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  /** Use accent (orange) instead of muted ring. Default false. */
  accent?: boolean;
  /** Visible label for screen readers. Default "Loading". */
  label?: string;
}

const sizeClass: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-10 border-[3px]',
};

/**
 * v4 Spinner — minimal SVG-less spinner using border + animation.
 * Use accent variant sparingly for primary CTAs / hero loaders.
 */
export function Spinner({ size = 'md', accent = false, label = 'Loading', className, ...rest }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'inline-block rounded-pill animate-spin',
        accent
          ? 'border-[color-mix(in_srgb,var(--brand-500)_25%,transparent)] border-t-accent'
          : 'border-outline-subtle border-t-fg-muted',
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
