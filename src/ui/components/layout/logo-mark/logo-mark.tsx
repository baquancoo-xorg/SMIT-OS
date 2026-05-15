import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { springs } from '@/ui/lib/motion';
import { cn } from '@/ui/lib/cn';
import {
  LOOP_ROUTES,
  POSITION_TRANSFORMS,
  ROUTE_POSITIONS,
  type RouteKey,
} from './positions';

type LogoMarkMode = 'route' | 'loop';

interface LogoMarkProps {
  mode?: LogoMarkMode;
  route?: RouteKey;
  size?: number;
  pulseOnChange?: boolean;
  loopInterval?: number;
  className?: string;
}

/**
 * LogoMark — SMIT OS animated logo
 *
 * 2x2 grid với white + orange tiles di chuyển theo route hoặc loop.
 * - mode='route': nhận `route` prop, animate khi route đổi + pulse FX
 * - mode='loop' : auto-cycle qua LOOP_ROUTES mỗi `loopInterval` ms
 */
export function LogoMark({
  mode = 'route',
  route = 'dashboard',
  size = 28,
  pulseOnChange = true,
  loopInterval = 2500,
  className,
}: LogoMarkProps) {
  // Loop mode state
  const [loopIdx, setLoopIdx] = useState(0);

  useEffect(() => {
    if (mode !== 'loop') return;
    const id = setInterval(() => {
      setLoopIdx((i) => (i + 1) % LOOP_ROUTES.length);
    }, loopInterval);
    return () => clearInterval(id);
  }, [mode, loopInterval]);

  const effectiveRoute: RouteKey =
    mode === 'loop' ? LOOP_ROUTES[loopIdx] : route;

  // Pulse trigger — re-mount orange tile on route change
  const prevRoute = useRef<RouteKey>(effectiveRoute);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (!pulseOnChange) return;
    if (prevRoute.current !== effectiveRoute) {
      setPulseKey((k) => k + 1);
      prevRoute.current = effectiveRoute;
    }
  }, [effectiveRoute, pulseOnChange]);

  const { white, orange } = ROUTE_POSITIONS[effectiveRoute];
  const whiteT = POSITION_TRANSFORMS[white];
  const orangeT = POSITION_TRANSFORMS[orange];

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={cn('logo-mark', className)}
      aria-label="SMIT OS"
      role="img"
    >
      <line x1="20" y1="3" x2="20" y2="10" className="logo-crosshair" />
      <line x1="20" y1="30" x2="20" y2="37" className="logo-crosshair" />
      <line x1="3" y1="20" x2="10" y2="20" className="logo-crosshair" />
      <line x1="30" y1="20" x2="37" y2="20" className="logo-crosshair" />

      <rect x="11" y="11" width="8" height="8" rx="1.5" className="logo-frame" />
      <rect x="21" y="11" width="8" height="8" rx="1.5" className="logo-frame" />
      <rect x="11" y="21" width="8" height="8" rx="1.5" className="logo-frame" />
      <rect x="21" y="21" width="8" height="8" rx="1.5" className="logo-frame" />

      <motion.rect
        width="8"
        height="8"
        rx="1.5"
        className="logo-tile-white"
        initial={false}
        animate={{ x: 11 + whiteT.dx, y: 11 + whiteT.dy }}
        transition={springs.glacial}
      />

      <motion.rect
        key={pulseOnChange ? `pulse-${pulseKey}` : undefined}
        width="8"
        height="8"
        rx="1.5"
        className={cn(
          'logo-tile-orange',
          pulseOnChange && pulseKey > 0 && 'logo-pulse',
        )}
        initial={false}
        animate={{ x: 11 + orangeT.dx, y: 11 + orangeT.dy }}
        transition={springs.glacial}
      />
    </svg>
  );
}
