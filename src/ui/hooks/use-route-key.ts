import { useLocation } from 'react-router-dom';
import type { RouteKey } from '@/ui/components/layout/logo-mark';

/**
 * Map pathname first segment → RouteKey for LogoMark.
 * Handles redirect aliases (lead-tracker → leads, etc.) defined in App.tsx.
 */
const SEGMENT_ALIASES: Record<string, RouteKey> = {
  'lead-tracker': 'leads',
  'ads-tracker': 'ads',
  'media-tracker': 'media',
  integrations: 'settings',
};

const KNOWN_ROUTES: ReadonlyArray<RouteKey> = [
  'dashboard',
  'okrs',
  'leads',
  'ads',
  'media',
  'daily-sync',
  'checkin',
  'settings',
  'reports',
  'profile',
  'playground',
];

export function useRouteKey(): RouteKey {
  const { pathname } = useLocation();
  const seg = pathname.split('/')[1] || 'dashboard';
  if (SEGMENT_ALIASES[seg]) return SEGMENT_ALIASES[seg];
  return (KNOWN_ROUTES as readonly string[]).includes(seg)
    ? (seg as RouteKey)
    : 'dashboard';
}
