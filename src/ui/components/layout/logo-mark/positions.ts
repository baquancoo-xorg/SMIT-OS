export type TilePosition = 'TL' | 'TR' | 'BL' | 'BR';

export type RouteKey =
  | 'dashboard'
  | 'okrs'
  | 'leads'
  | 'ads'
  | 'media'
  | 'daily-sync'
  | 'checkin'
  | 'settings'
  | 'reports'
  | 'profile'
  | 'playground';

export interface LogoTilePair {
  white: TilePosition;
  orange: TilePosition;
}

export const ROUTE_POSITIONS: Record<RouteKey, LogoTilePair> = {
  dashboard: { white: 'TL', orange: 'BR' },
  okrs: { white: 'TR', orange: 'BL' },
  leads: { white: 'BR', orange: 'TL' },
  ads: { white: 'BL', orange: 'TR' },
  media: { white: 'TL', orange: 'TR' },
  'daily-sync': { white: 'BL', orange: 'BR' },
  checkin: { white: 'TL', orange: 'BL' },
  settings: { white: 'TR', orange: 'BR' },
  reports: { white: 'BR', orange: 'TR' },
  profile: { white: 'TR', orange: 'TL' },
  playground: { white: 'BL', orange: 'TL' },
};

export const POSITION_TRANSFORMS: Record<TilePosition, { dx: number; dy: number }> = {
  TL: { dx: 0, dy: 0 },
  TR: { dx: 10, dy: 0 },
  BL: { dx: 0, dy: 10 },
  BR: { dx: 10, dy: 10 },
};

export const LOOP_ROUTES: RouteKey[] = [
  'dashboard',
  'okrs',
  'leads',
  'ads',
  'media',
  'checkin',
  'settings',
];
