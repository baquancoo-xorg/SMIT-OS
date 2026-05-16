export type LogoFrame = {
  white: [number, number];
  orange: [number, number];
};

export const FRAMES: ReadonlyArray<LogoFrame> = [
  { white: [0, 0], orange: [0, 0] },        // 0  /dashboard
  { white: [10, 0], orange: [-10, 0] },     // 1  /okrs
  { white: [10, 10], orange: [-10, -10] },  // 2  /leads
  { white: [0, 10], orange: [0, -10] },     // 3  /ads
  { white: [0, 0], orange: [0, -10] },      // 4  /media
  { white: [0, 10], orange: [0, 0] },       // 5  /daily-sync
  { white: [0, 0], orange: [-10, 0] },      // 6  /checkin (weekly-checkin)
  { white: [10, 0], orange: [0, 0] },       // 7  /settings
  { white: [-10, 0], orange: [10, 0] },     // 8  /reports
  { white: [-10, 10], orange: [10, -10] },  // 9  /profile
  { white: [-10, -10], orange: [10, 10] },  // 10 /login
  { white: [0, -10], orange: [0, 10] },     // 11 fallback
];

const PATHNAME_TO_FRAME: ReadonlyArray<[string, number]> = [
  ['/dashboard', 0],
  ['/okrs', 1],
  ['/leads', 2],
  ['/lead-tracker', 2],
  ['/ads', 3],
  ['/ads-tracker', 3],
  ['/media', 4],
  ['/media-tracker', 4],
  ['/daily-sync', 5],
  ['/checkin', 6],
  ['/weekly-checkin', 6],
  ['/settings', 7],
  ['/integrations', 7],
  ['/reports', 8],
  ['/profile', 9],
  ['/login', 10],
];

export const FALLBACK_FRAME_INDEX = 11;
export const IDLE_LOOP_DURATION_MS = 4000;

export function resolveFrameIndex(pathname: string): number {
  if (!pathname) return FALLBACK_FRAME_INDEX;
  // longest-prefix match
  let bestLen = -1;
  let bestIdx = FALLBACK_FRAME_INDEX;
  for (const [prefix, idx] of PATHNAME_TO_FRAME) {
    if ((pathname === prefix || pathname.startsWith(prefix + '/')) && prefix.length > bestLen) {
      bestLen = prefix.length;
      bestIdx = idx;
    }
  }
  return bestIdx;
}
