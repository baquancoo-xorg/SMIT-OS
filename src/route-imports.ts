// Centralized lazy route imports.
// Shared between App.tsx (React.lazy) and sidebar (hover prefetch) so a chunk
// fetch triggered on hover hits the same module promise the router awaits on
// click — no duplicate map drift, no double fetch.

export const routeImports: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('./pages/DashboardOverview'),
  '/personnel': () => import('./pages/Personnel'),
  '/leads': () => import('./pages/LeadTracker'),
  '/ads': () => import('./pages/AdsTracker'),
  '/media': () => import('./pages/MediaTracker'),
  '/reports': () => import('./pages/Reports'),
  '/okrs': () => import('./pages/OKRsManagement'),
  '/daily-sync': () => import('./pages/DailySync'),
  '/checkin': () => import('./pages/WeeklyCheckin'),
  '/settings': () => import('./pages/Settings'),
  '/profile': () => import('./pages/Profile'),
  '/playground': () => import('./pages/Playground'),
};

export function prefetchRoute(href: string): void {
  const loader = routeImports[href];
  if (loader) {
    // Fire-and-forget. Browser dedupes parallel fetches of same module URL;
    // React.lazy reuses the cached promise once the route mounts.
    void loader();
  }
}
