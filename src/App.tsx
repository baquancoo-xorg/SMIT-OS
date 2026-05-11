/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui';

// Phase 2 dev-only: v4 component playground, bypasses auth + AppLayout.
// Deleted at Phase 3 per plan-02.
const DesignV4Playground = lazy(() => import('./design/v4/playground'));

// Phase 8 (2026-05-11) — v1 pages hard-deleted. Rollback flag `?v=1` retired.
// Old `?v=2` flag is harmless no-op for legacy bookmarks.
const OKRsManagement = lazy(() => import('./pages/OKRsManagement'));
const WeeklyCheckin = lazy(() => import('./pages/WeeklyCheckin'));
const DailySync = lazy(() => import('./pages/DailySync'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const LeadTracker = lazy(() => import('./pages/LeadTracker'));
const MediaTracker = lazy(() => import('./pages/MediaTracker'));
const AdsTracker = lazy(() => import('./pages/AdsTracker'));

function PageLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-surface">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

function AppContent() {
  const { currentUser, loading, logout } = useAuth();
  const location = useLocation();

  // v4 dev playground bypasses auth + AppLayout (Phase 2 review).
  if (location.pathname.startsWith('/v4/')) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/v4/playground" element={<DesignV4Playground />} />
          <Route path="*" element={<Navigate to="/v4/playground" replace />} />
        </Routes>
      </Suspense>
    );
  }

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

  return (
    <AppLayout onLogout={logout}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/okrs" element={<OKRsManagement />} />
          <Route path="/daily-sync" element={<DailySync />} />
          <Route path="/checkin" element={<WeeklyCheckin />} />
          <Route path="/lead-tracker" element={<LeadTracker />} />
          <Route path="/media-tracker" element={<MediaTracker />} />
          <Route path="/ads-tracker" element={<AdsTracker />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
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
