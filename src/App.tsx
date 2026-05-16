/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/shell';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui';
import { PageLoader } from './components/branding';
import { routeImports } from './route-imports';

// Centralized lazy imports — see route-imports.ts. Sidebar hover prefetch and
// React.lazy share the same module promise, so a prefetched chunk satisfies
// the route's Suspense boundary instantly.
type LazyModule = { default: ComponentType<unknown> };
const lazyRoute = (href: string) => lazy(routeImports[href] as () => Promise<LazyModule>);

const DashboardOverview = lazyRoute('/dashboard');
const Personnel = lazyRoute('/personnel');
const LeadTracker = lazyRoute('/leads');
const AdsTracker = lazyRoute('/ads');
const MediaTracker = lazyRoute('/media');
const Reports = lazyRoute('/reports');
const OKRsManagement = lazyRoute('/okrs');
const DailySync = lazyRoute('/daily-sync');
const WeeklyCheckin = lazyRoute('/checkin');
const Settings = lazyRoute('/settings');
const Profile = lazyRoute('/profile');
const Playground = lazyRoute('/playground');

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
