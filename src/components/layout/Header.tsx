import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import OkrCycleCountdown from './OkrCycleCountdown';

const ROUTE_BREADCRUMBS: Record<string, [string, string]> = {
  '/dashboard': ['Analytics', 'Dashboard'],
  '/okrs': ['Planning', 'OKRs'],
  '/daily-sync': ['Rituals', 'Daily Sync'],
  '/checkin': ['Rituals', 'Weekly Check-in'],
  '/lead-tracker': ['CRM', 'Lead Tracker'],
  '/media-tracker': ['Acquisition', 'Media Tracker'],
  '/ads-tracker': ['Acquisition', 'Ads Tracker'],
  '/settings': ['System', 'Settings'],
  '/profile': ['User', 'Profile'],
};

function resolveBreadcrumb(pathname: string): [string, string] {
  const exact = ROUTE_BREADCRUMBS[pathname];
  if (exact) return exact;
  const slug = pathname.replace(/^\//, '').split('/')[0] ?? '';
  if (!slug) return ['Workspace', 'Home'];
  const label = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return ['Workspace', label];
}

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation();
  const [section, page] = resolveBreadcrumb(location.pathname);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/5">
      <div className="w-full h-full px-[var(--content-px-mobile)] md:px-[var(--content-px-tablet)] xl:pl-[calc(16rem+var(--content-px-desktop))] xl:pr-[var(--content-px-desktop)] flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="xl:hidden w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/30 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant truncate">
            <span>{section}</span>
            <span className="text-on-surface-variant/60">›</span>
            <span className="font-semibold text-on-surface truncate">{page}</span>
          </div>
        </div>

        {/* Widgets - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <OkrCycleCountdown />
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}
