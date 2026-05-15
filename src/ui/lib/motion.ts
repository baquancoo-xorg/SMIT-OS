import { type Transition } from 'motion/react';

export const springs = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 } satisfies Transition,
  soft: { type: 'spring', stiffness: 200, damping: 25 } satisfies Transition,
  bouncy: { type: 'spring', stiffness: 500, damping: 20 } satisfies Transition,
  glacial: { type: 'spring', stiffness: 80, damping: 22 } satisfies Transition,
} as const;

export const easings = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuart: [0.25, 1, 0.5, 1],
  smooth: [0.32, 0.72, 0, 1],
  spring: [0.34, 1.56, 0.64, 1],
  springSoft: [0.5, 1.25, 0.6, 1],
} as const;

export const stagger = {
  default: { delayChildren: 0.05, staggerChildren: 0.06 },
  fast: { delayChildren: 0.02, staggerChildren: 0.03 },
  slow: { delayChildren: 0.1, staggerChildren: 0.1 },
} as const;

export const fadeInUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: springs.snappy,
};
