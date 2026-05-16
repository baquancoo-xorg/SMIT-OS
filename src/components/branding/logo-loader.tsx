import type { HTMLAttributes } from 'react';
import { AnimatedLogo } from './animated-logo';
import type { AnimatedLogoSize } from './animated-logo';

interface BaseLoaderProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

/** Full-screen Suspense fallback. Use at app/route shell level. */
export function PageLoader({ label = 'Đang tải', className, ...rest }: BaseLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={['flex h-full min-h-[60vh] w-full items-center justify-center bg-surface', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <AnimatedLogo size="xl" looping label={label} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Section-level Suspense fallback. Use for data-region boundary, NOT card-level. */
export function SectionLoader({
  label = 'Đang tải',
  minHeight = '12rem',
  className,
  style,
  ...rest
}: BaseLoaderProps & { minHeight?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={['flex w-full items-center justify-center', className].filter(Boolean).join(' ')}
      style={{ minHeight, ...style }}
      {...rest}
    >
      <AnimatedLogo size="lg" looping label={label} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

interface InlineLoaderProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
  size?: Extract<AnimatedLogoSize, 'xs' | 'sm'>;
}

/** Inline loader — for buttons, toasts, inline status. */
export function InlineLoader({ label = 'Đang tải', size = 'xs', className, ...rest }: InlineLoaderProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={['inline-flex items-center', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <AnimatedLogo size={size} looping label={label} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
