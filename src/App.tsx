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

const OKRsManagement = lazy(() => import('./pages/OKRsManagement'));
const WeeklyCheckin = lazy(() => import('./pages/WeeklyCheckin'));
const DailySync = lazy(() => import('./pages/DailySync'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const LeadTracker = lazy(() => import('./pages/LeadTracker'));
const MediaTracker = lazy(() => import('./pages/MediaTracker'));
const AdsTracker = lazy(() => import('./pages/AdsTracker'));

// Phase 5 v2 page migrations — opt-in via `?v=2` query param.
const ProfileV2 = lazy(() => import('./pages/v2/Profile'));
const LoginPageV2 = lazy(() => import('./pages/v2/LoginPage'));
const SettingsV2 = lazy(() => import('./pages/v2/Settings'));

// Phase 6 v2 page migrations — medium pages.
const DailySyncV2 = lazy(() => import('./pages/v2/DailySync'));
const WeeklyCheckinV2 = lazy(() => import('./pages/v2/WeeklyCheckin'));
const LeadTrackerV2 = lazy(() => import('./pages/v2/LeadTracker'));
const MediaTrackerV2 = lazy(() => import('./pages/v2/MediaTracker'));
const AdsTrackerV2 = lazy(() => import('./pages/v2/AdsTracker'));

// Phase 7 v2 page migrations — large pages (batch 1: Dashboard).
const DashboardOverviewV2 = lazy(() => import('./pages/v2/DashboardOverview'));

function PageLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

/**
 * `?v=2` query param flips routes to v2 implementations.
 * Use for preview/A/B testing during Phase 5-7 migration. Param sticks while
 * navigating because react-router preserves search by default on `<Link>`.
 */
function useIsV2() {
  const [params] = useSearchParams();
  return params.get('v') === '2';
}

function AppContent() {
  const { currentUser, loading, logout } = useAuth();
  const isV2 = useIsV2();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return isV2 ? (
      <Suspense fallback={<PageLoader />}>
        <LoginPageV2 />
      </Suspense>
    ) : (
      <LoginPage />
    );
  }

  return (
    <AppLayout onLogout={logout}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={isV2 ? <DashboardOverviewV2 /> : <DashboardOverview />} />
          <Route path="/okrs" element={<OKRsManagement />} />
          <Route path="/daily-sync" element={isV2 ? <DailySyncV2 /> : <DailySync />} />
          <Route path="/checkin" element={isV2 ? <WeeklyCheckinV2 /> : <WeeklyCheckin />} />
          <Route path="/lead-tracker" element={isV2 ? <LeadTrackerV2 /> : <LeadTracker />} />
          <Route path="/media-tracker" element={isV2 ? <MediaTrackerV2 /> : <MediaTracker />} />
          <Route path="/ads-tracker" element={isV2 ? <AdsTrackerV2 /> : <AdsTracker />} />
          <Route path="/settings" element={isV2 ? <SettingsV2 /> : <Settings />} />
          <Route path="/profile" element={isV2 ? <ProfileV2 /> : <Profile />} />
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
