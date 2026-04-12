/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import PMDashboard from './pages/PMDashboard';
import OKRsManagement from './pages/OKRsManagement';
import TechScrumBoard from './pages/TechScrumBoard';
import MarketingKanban from './pages/MarketingKanban';
import MediaKanban from './pages/MediaKanban';
import SaleKanban from './pages/SaleKanban';
import SaturdaySync from './pages/SaturdaySync';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';

export type ViewType = 'dashboard' | 'okrs' | 'tech' | 'mkt' | 'media' | 'sale' | 'sync' | 'settings' | 'profile';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const { currentUser, users, setCurrentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-xl border border-outline-variant/10 text-center">
          <h2 className="text-3xl font-black font-headline mb-2">Welcome to SMIT OS</h2>
          <p className="text-slate-500 mb-8 font-medium">Please select a user to continue</p>
          <div className="grid gap-4">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className="flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/10 hover:bg-slate-50 transition-all text-left group"
              >
                <img src={user.avatar} alt={user.fullName} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-on-surface">{user.fullName}</p>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{user.department} • {user.role}</p>
                </div>
                <span className="material-symbols-outlined ml-auto opacity-0 group-hover:opacity-100 transition-opacity">login</span>
              </button>
            ))}
            {users.length === 0 && (
              <p className="text-sm text-error font-bold">No users found in database. Please seed the database.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && <PMDashboard />}
      {currentView === 'okrs' && <OKRsManagement />}
      {currentView === 'tech' && <TechScrumBoard />}
      {currentView === 'mkt' && <MarketingKanban />}
      {currentView === 'media' && <MediaKanban />}
      {currentView === 'sale' && <SaleKanban />}
      {currentView === 'sync' && <SaturdaySync />}
      {currentView === 'settings' && <Settings />}
      {currentView === 'profile' && <Profile />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
