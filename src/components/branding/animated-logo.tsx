import { forwardRef, useEffect, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { resolveFrameIndex, FALLBACK_FRAME_INDEX } from './logo-routes';
import './animated-logo.css';

export type AnimatedLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AnimatedLogoProps extends HTMLAttributes<HTMLSpanElement> {
  /** Pathname or known route key. If provided, drives `data-frame`. */
  route?: string;
  /** Explicit frame index (0-11). Wins over `route`. */
  frame?: number;
  size?: AnimatedLogoSize;
  /** Run idle loop cycling 12 frames over 4s. */
  looping?: boolean;
  /** Accessible label. Default: "SMIT OS". */
  label?: string;
}

export const AnimatedLogo = forwardRef<HTMLSpanElement, AnimatedLogoProps>(
  (
    {
      route,
      frame,
      size = 'md',
      looping = false,
      label = 'SMIT OS',
      className,
      ...rest
    },
    ref,
  ) => {
    const resolvedFrame =
      typeof frame === 'number'
        ? Math.max(0, Math.min(11, frame))
        : route
        ? resolveFrameIndex(route)
        : FALLBACK_FRAME_INDEX;

    // Pause loop when tab hidden — battery friendly.
    const [paused, setPaused] = useState(false);
    useEffect(() => {
      if (!looping) return;
      const onVis = () => setPaused(document.hidden);
      onVis();
      document.addEventListener('visibilitychange', onVis);
      return () => document.removeEventListener('visibilitychange', onVis);
    }, [looping]);

    const cls = ['smit-logo', `smit-logo--${size}`, className].filter(Boolean).join(' ');

    return (
      <span
        ref={ref}
        className={cls}
        role="img"
        aria-label={label}
        data-frame={resolvedFrame}
        data-looping={looping || undefined}
        data-paused={paused || undefined}
        {...rest}
      >
        <svg viewBox="0 0 40 40" aria-hidden="true">
          {/* Decorative cross strokes */}
          <path d="M20 4V11" stroke="var(--text-muted, currentColor)" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
          <path d="M20 29V36" stroke="var(--text-muted, currentColor)" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
          <path d="M4 20H11" stroke="var(--text-muted, currentColor)" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
          <path d="M29 20H36" stroke="var(--text-muted, currentColor)" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
          {/* 4 static tile frames */}
          <rect className="smit-logo__tile-frame" x="11" y="11" width="8" height="8" rx="1.5" />
          <rect className="smit-logo__tile-frame" x="21" y="11" width="8" height="8" rx="1.5" />
          <rect className="smit-logo__tile-frame" x="11" y="21" width="8" height="8" rx="1.5" />
          <rect className="smit-logo__tile-frame" x="21" y="21" width="8" height="8" rx="1.5" />
          {/* 2 animated tiles */}
          <rect className="smit-logo__tile-white" x="11" y="11" width="8" height="8" rx="1.5" />
          <rect className="smit-logo__tile-orange" x="21" y="21" width="8" height="8" rx="1.5" />
        </svg>
      </span>
    );
  },
);

AnimatedLogo.displayName = 'AnimatedLogo';
