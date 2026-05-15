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
import { LogoMark } from './ui/components/layout/logo-mark';

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

function AppLogoLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`${fullScreen ? 'h-screen w-screen' : 'h-full w-full'} flex items-center justify-center bg-surface`}
    >
      <LogoMark mode="loop" size={72} loopInterval={2000} />
      <span className="sr-only">Đang tải SMIT OS…</span>
    </div>
  );
}

function PageLoader() {
  return <AppLogoLoader />;
}

function AppContent() {
  const { currentUser, loading, logout } = useAuth();

  if (loading) {
    return <AppLogoLoader fullScreen />;
  }

  if (!currentUser) {
    return <LoginPage />;
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
