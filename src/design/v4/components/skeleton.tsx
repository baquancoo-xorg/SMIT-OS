import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export type SkeletonShape = 'rect' | 'circle' | 'text';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape;
  /** Tailwind width helper, e.g. 'w-32', 'w-full'. */
  width?: string;
  /** Tailwind height helper, e.g. 'h-4', 'h-6'. */
  height?: string;
  /** Number of stacked text lines. Used when shape="text". Default 1. */
  lines?: number;
}

/**
 * v4 Skeleton — shimmer placeholder for loading states.
 * Shapes: rect (default), circle (avatars), text (multi-line).
 */
export function Skeleton({
  shape = 'rect',
  width = 'w-full',
  height = 'h-4',
  lines = 1,
  className,
  ...rest
}: SkeletonProps) {
  const base = cn(
    'animate-pulse bg-surface-overlay',
    shape === 'circle' && 'rounded-pill',
    shape === 'rect' && 'rounded-input',
    shape === 'text' && 'rounded-pill',
  );

  if (shape === 'text' && lines > 1) {
    return (
      <div className={cn('flex flex-col gap-xs', className)} role="status" aria-busy="true" {...rest}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(base, height, i === lines - 1 ? 'w-2/3' : width)}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return <div role="status" aria-busy="true" className={cn(base, width, height, className)} {...rest} />;
}
