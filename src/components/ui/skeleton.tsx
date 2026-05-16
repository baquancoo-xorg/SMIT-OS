import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

export type SkeletonVariant = 'text' | 'circle' | 'rect';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  /** CSS width (px, %, rem). Default: full width for text/rect, square for circle. */
  width?: number | string;
  /** CSS height (px, %, rem). Default: 1em for text, square for circle, 5rem for rect. */
  height?: number | string;
  /** Number of lines (text variant only). Renders stacked skeleton lines. */
  lines?: number;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'rounded-sm',
  circle: 'rounded-full',
  rect: 'rounded-lg',
};

/**
 * Skeleton v2 — placeholder shimmer for loading states.
 *
 * Three variants: `text` (lines), `circle` (avatar), `rect` (image/card).
 * Uses Tailwind's `animate-pulse` (respects prefers-reduced-motion via global rule).
 *
 * @example
 * <Skeleton variant="circle" width={40} />
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="rect" height={120} />
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      lines = 1,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const baseClass = [
      'block animate-pulse bg-surface-container-high',
      variantStyles[variant],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const resolvedStyle: CSSProperties = {
      ...style,
      width: width ?? (variant === 'circle' ? height ?? '2rem' : '100%'),
      height:
        height ??
        (variant === 'text' ? '1em' : variant === 'circle' ? width ?? '2rem' : '5rem'),
    };

    if (variant === 'text' && lines > 1) {
      return (
        <div
          ref={ref}
          aria-hidden="true"
          className="flex flex-col gap-2"
          {...props}
        >
          {Array.from({ length: lines }).map((_, i) => (
            <span
              key={i}
              className={baseClass}
              style={{
                ...resolvedStyle,
                // Last line shorter — natural look
                width: i === lines - 1 ? '60%' : resolvedStyle.width,
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={baseClass}
        style={resolvedStyle}
        {...props}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';
