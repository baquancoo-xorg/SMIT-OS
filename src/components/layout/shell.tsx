import { useEffect, useState } from 'react';
import { ErrorBoundary } from '../ui';
import Header from './header';
import MobileNavDrawer from './mobile-nav-drawer';
import Sidebar from './sidebar';

const SIDEBAR_STORAGE_KEY = 'smit-sidebar-collapsed';

interface AppShellProps {
  children: React.ReactNode;
  onLogout: () => void;
}

function getInitialCollapsed() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

export default function AppShell({ children, onLogout }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.shell = 'v5';
    return () => {
      delete document.documentElement.dataset.shell;
    };
  }, []);

  const handleCollapsedChange = (nextCollapsed: boolean) => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextCollapsed));
    setCollapsed(nextCollapsed);
  };

  return (
    <div className="flex min-h-dvh bg-bg text-text-1">
      <div className="sticky top-0 hidden h-dvh shrink-0 xl:block">
        <Sidebar collapsed={collapsed} onCollapsedChange={handleCollapsedChange} onLogout={onLogout} />
      </div>
      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onCollapsedChange={handleCollapsedChange}
        onLogout={onLogout}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="min-h-[var(--content-h)] flex-1 overflow-y-auto px-[var(--content-px-mobile)] py-[var(--page-pt)] md:px-[var(--content-px-tablet)] xl:px-[var(--content-px-desktop)]">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
