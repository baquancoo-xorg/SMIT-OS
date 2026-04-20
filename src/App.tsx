/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import PMDashboard from './pages/PMDashboard';
import OKRsManagement from './pages/OKRsManagement';
import TechBoard from './pages/TechBoard';
import ProductBacklog from './pages/ProductBacklog';
import MarketingBoard from './pages/MarketingBoard';
import MediaBoard from './pages/MediaBoard';
import SaleBoard from './pages/SaleBoard';
import SaturdaySync from './pages/SaturdaySync';
import DailySync from './pages/DailySync';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import DashboardOverview from './pages/DashboardOverview';
import SprintBoard from './pages/SprintBoard';
import LeadTracker from './pages/LeadTracker';
import EpicBoard from './pages/EpicBoard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

export type ViewType = 'dashboard' | 'okrs' | 'tech' | 'backlog' | 'mkt' | 'media' | 'sale' | 'sync' | 'daily-sync' | 'settings' | 'profile' | 'ads-overview' | 'sprint' | 'lead-tracker' | 'epics';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const { currentUser, loading, logout } = useAuth();

  const SCROLLABLE_VIEWS: ViewType[] = ['okrs', 'settings', 'profile', 'sync', 'daily-sync', 'ads-overview', 'lead-tracker'];

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <AppLayout currentView={currentView} onViewChange={setCurrentView} onLogout={logout} scrollable={SCROLLABLE_VIEWS.includes(currentView)}>
      {currentView === 'dashboard' && <PMDashboard key="dashboard" />}
      {currentView === 'okrs' && <OKRsManagement key="okrs" />}
      {currentView === 'tech' && <TechBoard key="tech" />}
      {currentView === 'backlog' && <ProductBacklog key="backlog" />}
      {currentView === 'mkt' && <MarketingBoard key="mkt" />}
      {currentView === 'media' && <MediaBoard key="media" />}
      {currentView === 'sale' && <SaleBoard key="sale" />}
      {currentView === 'sync' && <SaturdaySync key="sync" />}
      {currentView === 'daily-sync' && <DailySync key="daily-sync" />}
      {currentView === 'settings' && <Settings key="settings" />}
      {currentView === 'profile' && <Profile key="profile" />}
      {currentView === 'ads-overview' && <DashboardOverview key="ads-overview" />}
      {currentView === 'sprint' && <SprintBoard key="sprint" />}
      {currentView === 'lead-tracker' && <LeadTracker key="lead-tracker" />}
      {currentView === 'epics' && <EpicBoard key="epics" />}
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
