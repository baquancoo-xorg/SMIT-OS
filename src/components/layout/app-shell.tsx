import { type FocusEvent, type MouseEvent, useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import AppHeader from './app-header';
import MobileNavDrawer from './mobile-nav-drawer';
import AppSidebar from './app-sidebar';

const SIDEBAR_STORAGE_KEY = 'smit-sidebar-collapsed';
const TABLET_SHELL_QUERY = '(min-width: 768px) and (max-width: 1279px)';

interface AppShellProps {
  children: React.ReactNode;
  onLogout: () => void;
}

function getInitialCollapsed() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

function getInitialTabletShell() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(TABLET_SHELL_QUERY).matches;
}

export default function AppShell({ children, onLogout }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isTabletShell, setIsTabletShell] = useState(getInitialTabletShell);
  const [tabletExpanded, setTabletExpanded] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.shell = 'v5';
    return () => {
      delete document.documentElement.dataset.shell;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(TABLET_SHELL_QUERY);
    const handleChange = () => {
      setIsTabletShell(mediaQuery.matches);
      if (!mediaQuery.matches) setTabletExpanded(false);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleCollapsedChange = (nextCollapsed: boolean) => {
    if (isTabletShell) {
      setTabletExpanded(!nextCollapsed);
      return;
    }

    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextCollapsed));
    setCollapsed(nextCollapsed);
  };

  const expandTabletSidebar = () => {
    if (isTabletShell) setTabletExpanded(true);
  };

  const collapseTabletSidebar = () => {
    if (isTabletShell) setTabletExpanded(false);
  };

  const handleSidebarBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) collapseTabletSidebar();
  };

  const handleSidebarNavigate = () => {
    collapseTabletSidebar();
  };

  const handleCollapsedNavClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isTabletShell || tabletExpanded) {
      handleSidebarNavigate();
      return;
    }

    event.preventDefault();
    setTabletExpanded(true);
  };

  const sidebarCollapsed = isTabletShell ? !tabletExpanded : collapsed;

  return (
    <div className="flex min-h-dvh bg-bg text-text-1">
      <div className="sticky top-0 hidden h-dvh shrink-0 md:block">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={handleCollapsedChange}
          onLogout={onLogout}
          onNavigate={handleSidebarNavigate}
          onCollapsedNavClick={handleCollapsedNavClick}
          onPointerEnter={expandTabletSidebar}
          onPointerLeave={collapseTabletSidebar}
          onPointerDown={expandTabletSidebar}
          onFocusCapture={expandTabletSidebar}
          onBlurCapture={handleSidebarBlur}
        />
      </div>
      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onCollapsedChange={handleCollapsedChange}
        onLogout={onLogout}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="min-h-[var(--content-h)] flex-1 overflow-y-auto px-[var(--content-px-mobile)] py-[var(--page-pt)] md:px-[var(--content-px-tablet)] xl:px-[var(--content-px-desktop)]">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
