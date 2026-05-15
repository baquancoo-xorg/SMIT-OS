/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import V5Shell from './components/v5/layout/v5-shell';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/v5/ui';

// Phase 8 (2026-05-11) — v1 pages hard-deleted. Rollback flag `?v=1` retired.
// Old `?v=2` flag is harmless no-op for legacy bookmarks.
const OKRsManagement = lazy(() => import('./pages/v5/OKRsManagement'));
const WeeklyCheckin = lazy(() => import('./pages/v5/WeeklyCheckin'));
const DailySync = lazy(() => import('./pages/v5/DailySync'));
const Settings = lazy(() => import('./pages/v5/Settings'));
const Profile = lazy(() => import('./pages/v5/Profile'));
const DashboardOverview = lazy(() => import('./pages/v5/DashboardOverview'));
const LeadTracker = lazy(() => import('./pages/v5/LeadTracker'));
const MediaTracker = lazy(() => import('./pages/v5/MediaTracker'));
const AdsTracker = lazy(() => import('./pages/v5/AdsTracker'));
const Reports = lazy(() => import('./pages/v5/Reports'));
const Playground = lazy(() => import('./pages/v5/Playground'));
const V6Storybook = lazy(() => import('./pages/v6-storybook'));

function PageLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-surface">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

function AppContent() {
  const { currentUser, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  // v6 storybook route — isolated, no auth required for dev testing
  if (window.location.pathname === '/v6-storybook') {
    return (
      <Suspense fallback={<PageLoader />}>
        <V6Storybook />
      </Suspense>
    );
  }

  return (
    <V5Shell onLogout={logout}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/leads" element={<LeadTracker />} />
          <Route path="/ads" element={<AdsTracker />} />
          <Route path="/media" element={<MediaTracker />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/okrs" element={<OKRsManagement />} />
          <Route path="/daily-sync" element={<DailySync />} />
          <Route path="/checkin" element={<WeeklyCheckin />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/integrations" element={<Navigate to="/settings?tab=integrations" replace />} />
          <Route path="/lead-tracker" element={<Navigate to="/leads" replace />} />
          <Route path="/ads-tracker" element={<Navigate to="/ads" replace />} />
          <Route path="/media-tracker" element={<Navigate to="/media" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </V5Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
