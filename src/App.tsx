/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/v2';

// v1 pages — kept for `?v=1` rollback. Hard delete deferred until sub-component
// migration follow-up (v2 pages reuse v1 sub-components).
const OKRsManagement = lazy(() => import('./pages/OKRsManagement'));
const WeeklyCheckin = lazy(() => import('./pages/WeeklyCheckin'));
const DailySync = lazy(() => import('./pages/DailySync'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const LeadTracker = lazy(() => import('./pages/LeadTracker'));
const MediaTracker = lazy(() => import('./pages/MediaTracker'));
const AdsTracker = lazy(() => import('./pages/AdsTracker'));

// v2 pages — Phase 8 promoted as DEFAULT. Phase 5 (Auth/Profile/Settings).
const ProfileV2 = lazy(() => import('./pages/v2/Profile'));
const LoginPageV2 = lazy(() => import('./pages/v2/LoginPage'));
const SettingsV2 = lazy(() => import('./pages/v2/Settings'));

// v2 pages — Phase 6 medium pages.
const DailySyncV2 = lazy(() => import('./pages/v2/DailySync'));
const WeeklyCheckinV2 = lazy(() => import('./pages/v2/WeeklyCheckin'));
const LeadTrackerV2 = lazy(() => import('./pages/v2/LeadTracker'));
const MediaTrackerV2 = lazy(() => import('./pages/v2/MediaTracker'));
const AdsTrackerV2 = lazy(() => import('./pages/v2/AdsTracker'));

// v2 pages — Phase 7 large pages (Dashboard + OKRs).
const DashboardOverviewV2 = lazy(() => import('./pages/v2/DashboardOverview'));
const OKRsManagementV2 = lazy(() => import('./pages/v2/OKRsManagement'));

function PageLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

/**
 * `?v=1` query param rolls back to v1 pages.
 *
 * Phase 8 promoted v2 to default for ALL 10 pages (2026-05-10).
 * v1 source kept for emergency rollback + because v2 pages reuse many v1 sub-components.
 * `?v=2` is now no-op (v2 always default) — kept harmless for backward compat with bookmarks.
 */
function useIsV1() {
  const [params] = useSearchParams();
  return params.get('v') === '1';
}

function AppContent() {
  const { currentUser, loading, logout } = useAuth();
  const isV1 = useIsV1();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return isV1 ? (
      <LoginPage />
    ) : (
      <Suspense fallback={<PageLoader />}>
        <LoginPageV2 />
      </Suspense>
    );
  }

  return (
    <AppLayout onLogout={logout}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={isV1 ? <DashboardOverview /> : <DashboardOverviewV2 />} />
          <Route path="/okrs" element={isV1 ? <OKRsManagement /> : <OKRsManagementV2 />} />
          <Route path="/daily-sync" element={isV1 ? <DailySync /> : <DailySyncV2 />} />
          <Route path="/checkin" element={isV1 ? <WeeklyCheckin /> : <WeeklyCheckinV2 />} />
          <Route path="/lead-tracker" element={isV1 ? <LeadTracker /> : <LeadTrackerV2 />} />
          <Route path="/media-tracker" element={isV1 ? <MediaTracker /> : <MediaTrackerV2 />} />
          <Route path="/ads-tracker" element={isV1 ? <AdsTracker /> : <AdsTrackerV2 />} />
          <Route path="/settings" element={isV1 ? <Settings /> : <SettingsV2 />} />
          <Route path="/profile" element={isV1 ? <Profile /> : <ProfileV2 />} />
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
