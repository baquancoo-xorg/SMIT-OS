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

// v4 dev playground (bypasses auth + AppLayout) + v4 page routes (auth-gated, V4Shell).
const DesignV4Playground = lazy(() => import('./design/v4/playground'));
const V4Shell = lazy(() => import('./pages-v4/v4-shell').then((m) => ({ default: m.V4Shell })));
const V4DashboardOverview = lazy(() => import('./pages-v4/dashboard-overview'));
const V4LeadTracker = lazy(() => import('./pages-v4/lead-tracker'));
const V4AdsTracker = lazy(() => import('./pages-v4/ads-tracker'));
const V4MediaTracker = lazy(() => import('./pages-v4/media-tracker'));
const V4OkrsManagement = lazy(() => import('./pages-v4/okrs-management'));
const V4DailySync = lazy(() => import('./pages-v4/daily-sync'));
const V4WeeklyCheckin = lazy(() => import('./pages-v4/weekly-checkin'));
const V4Settings = lazy(() => import('./pages-v4/settings'));
const V4Profile = lazy(() => import('./pages-v4/profile'));

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

  // v4 routes: playground bypasses auth; other /v4/* gated by auth, wrapped in V4Shell.
  if (location.pathname.startsWith('/v4/')) {
    if (location.pathname === '/v4/playground') {
      return (
        <Suspense fallback={<PageLoader />}>
          <DesignV4Playground />
        </Suspense>
      );
    }
    if (loading) return <PageLoader />;
    if (!currentUser) return <LoginPage />;
    return (
      <Suspense fallback={<PageLoader />}>
        <V4Shell>
          <Routes>
            <Route path="/v4" element={<Navigate to="/v4/dashboard" replace />} />
            <Route path="/v4/dashboard" element={<V4DashboardOverview />} />
            <Route path="/v4/leads" element={<V4LeadTracker />} />
            <Route path="/v4/ads" element={<V4AdsTracker />} />
            <Route path="/v4/media" element={<V4MediaTracker />} />
            <Route path="/v4/okrs" element={<V4OkrsManagement />} />
            <Route path="/v4/daily-sync" element={<V4DailySync />} />
            <Route path="/v4/checkin" element={<V4WeeklyCheckin />} />
            <Route path="/v4/settings" element={<V4Settings />} />
            <Route path="/v4/profile" element={<V4Profile />} />
            <Route path="*" element={<Navigate to="/v4/dashboard" replace />} />
          </Routes>
        </V4Shell>
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
          {/* Phase 09 cutover (2026-05-12): root now lands on v4. v3 routes kept alive for 7-day evaluation window. */}
          <Route path="/" element={<Navigate to="/v4/dashboard" replace />} />
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
