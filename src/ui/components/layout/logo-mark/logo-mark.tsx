import { motion } from 'motion/react';
import { springs } from '@/ui/lib/motion';
import { ROUTE_POSITIONS, POSITION_TRANSFORMS, type RouteKey } from './positions';

interface LogoMarkProps {
  route: RouteKey;
  size?: number;
  className?: string;
}

/**
 * LogoMark — SMIT OS animated logo
 *
 * 4 frame tiles form a 2x2 grid. White + Orange tiles move between positions
 * based on current route. Both tiles animate smoothly from position to position.
 *
 * Grid positions:
 *   TL (11,11)  TR (21,11)
 *   BL (11,21)  BR (21,21)
 */
export function LogoMark({ route, size = 28, className }: LogoMarkProps) {
  const { white, orange } = ROUTE_POSITIONS[route];
  const whiteT = POSITION_TRANSFORMS[white];
  const orangeT = POSITION_TRANSFORMS[orange];

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={className}
      aria-label="SMIT OS"
    >
      {/* Crosshair guides */}
      <line x1="20" y1="3" x2="20" y2="10" className="logo-crosshair" />
      <line x1="20" y1="30" x2="20" y2="37" className="logo-crosshair" />
      <line x1="3" y1="20" x2="10" y2="20" className="logo-crosshair" />
      <line x1="30" y1="20" x2="37" y2="20" className="logo-crosshair" />

      {/* 4 dim frame tiles (grid skeleton) */}
      <rect x="11" y="11" width="8" height="8" rx="1.5" className="logo-frame" />
      <rect x="21" y="11" width="8" height="8" rx="1.5" className="logo-frame" />
      <rect x="11" y="21" width="8" height="8" rx="1.5" className="logo-frame" />
      <rect x="21" y="21" width="8" height="8" rx="1.5" className="logo-frame" />

      {/* White tile — animated between grid positions */}
      <motion.rect
        width="8"
        height="8"
        rx="1.5"
        className="logo-tile-white"
        initial={false}
        animate={{ x: 11 + whiteT.dx, y: 11 + whiteT.dy }}
        transition={springs.glacial}
      />

      {/* Orange tile — animated between grid positions */}
      <motion.rect
        width="8"
        height="8"
        rx="1.5"
        className="logo-tile-orange"
        initial={false}
        animate={{ x: 11 + orangeT.dx, y: 11 + orangeT.dy }}
        transition={springs.glacial}
      />
    </svg>
  );
}
