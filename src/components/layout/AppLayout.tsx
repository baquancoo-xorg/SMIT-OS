import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { ViewType } from '../../App';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  isAdmin: boolean;
}

export default function AppLayout({ children, currentView, onViewChange, onLogout, isAdmin }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-surface overflow-hidden font-sans text-on-surface">
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar currentView={currentView} onViewChange={(view) => { onViewChange(view); setIsSidebarOpen(false); }} onLogout={onLogout} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header onViewChange={onViewChange} onMenuClick={() => setIsSidebarOpen(true)} isAdmin={isAdmin} />
        <main className="flex-1 overflow-y-auto pt-20">
          <div className="p-4 md:p-8 min-h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
