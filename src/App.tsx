/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/shell';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui';
import { PageLoader } from './components/branding';

// Phase 8 (2026-05-11) — v1 pages hard-deleted. Rollback flag `?v=1` retired.
// Old `?v=2` flag is harmless no-op for legacy bookmarks.
const OKRsManagement = lazy(() => import('./pages/OKRsManagement'));
const WeeklyCheckin = lazy(() => import('./pages/WeeklyCheckin'));
const DailySync = lazy(() => import('./pages/DailySync'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const LeadTracker = lazy(() => import('./pages/LeadTracker'));
const Personnel = lazy(() => import('./pages/Personnel'));
const MediaTracker = lazy(() => import('./pages/MediaTracker'));
const AdsTracker = lazy(() => import('./pages/AdsTracker'));
const Reports = lazy(() => import('./pages/Reports'));
const Playground = lazy(() => import('./pages/Playground'));

function AppContent() {
  const { currentUser, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <PageLoader label="Đang xác thực" />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <AppShell onLogout={logout}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/personnel" element={<Personnel />} />
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
    </AppShell>
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
