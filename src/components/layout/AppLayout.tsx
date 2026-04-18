import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { ViewType } from '../../App';
import { ErrorBoundary } from '../ui';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
}

export default function AppLayout({ children, currentView, onViewChange, onLogout }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
        <Sidebar
          currentView={currentView}
          onViewChange={(view) => { onViewChange(view); setIsSidebarOpen(false); }}
          onLogout={onLogout}
          onSettingsClick={() => { onViewChange('settings'); setIsSidebarOpen(false); }}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header onMenuClick={() => setIsSidebarOpen(true)} onViewChange={onViewChange} />
        <main className="flex-1 overflow-y-auto pt-20">
          <ErrorBoundary>
            <div className="p-4 sm:p-5 md:p-6 lg:p-8 xl:px-10 min-h-full w-full">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
