import type { RouteKey } from '@/ui/components/layout/logo-mark/positions';

export function matchRoute(pathname: string): RouteKey {
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/okrs')) return 'okrs';
  if (pathname.startsWith('/leads')) return 'leads';
  if (pathname.startsWith('/ads')) return 'ads';
  if (pathname.startsWith('/media')) return 'media';
  if (pathname.startsWith('/daily-sync')) return 'daily-sync';
  if (pathname.startsWith('/checkin') || pathname.startsWith('/weekly-checkin')) return 'checkin';
  if (pathname.startsWith('/settings') || pathname.startsWith('/profile')) return 'settings';
  return 'dashboard';
}
