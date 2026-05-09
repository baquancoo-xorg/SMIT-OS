import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { ErrorBoundary } from '../ui';

interface AppLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const SCROLLABLE_PATHS = new Set(['/okrs', '/settings', '/profile', '/checkin', '/daily-sync', '/ads-overview', '/lead-tracker']);

export default function AppLayout({ children, onLogout }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { pathname } = useLocation();
  const scrollable = SCROLLABLE_PATHS.has(pathname);

  // Escape key handler for mobile sidebar
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-surface overflow-hidden font-sans text-on-surface">
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 xl:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <div className={`fixed xl:static inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out xl:translate-x-0 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onLogout={onLogout} onNavigate={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 flex flex-col overflow-hidden pt-16">
          <ErrorBoundary>
            <div className={`flex-1 min-h-0 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'} page-padding w-full overflow-x-hidden`}>
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
