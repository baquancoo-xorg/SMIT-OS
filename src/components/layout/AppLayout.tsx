import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { ViewType } from '../../App';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function AppLayout({ children, currentView, onViewChange }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-surface overflow-hidden font-sans text-on-surface">
      <Sidebar currentView={currentView} onViewChange={onViewChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="ml-72 pt-16 flex-1 overflow-y-auto">
          <div className="p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
