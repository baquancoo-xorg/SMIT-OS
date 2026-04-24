/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const PMDashboard = lazy(() => import('./pages/PMDashboard'));
const OKRsManagement = lazy(() => import('./pages/OKRsManagement'));
const TechBoard = lazy(() => import('./pages/TechBoard'));
const ProductBacklog = lazy(() => import('./pages/ProductBacklog'));
const MarketingBoard = lazy(() => import('./pages/MarketingBoard'));
const MediaBoard = lazy(() => import('./pages/MediaBoard'));
const SaleBoard = lazy(() => import('./pages/SaleBoard'));
const SaturdaySync = lazy(() => import('./pages/SaturdaySync'));
const DailySync = lazy(() => import('./pages/DailySync'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const SprintBoard = lazy(() => import('./pages/SprintBoard'));
const LeadTracker = lazy(() => import('./pages/LeadTracker'));

function PageLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

function AppContent() {
  const { currentUser, loading, logout } = useAuth();

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
    <AppLayout onLogout={logout}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<PMDashboard />} />
          <Route path="/ads-overview" element={<DashboardOverview />} />
          <Route path="/okrs" element={<OKRsManagement />} />
          <Route path="/tech" element={<TechBoard />} />
          <Route path="/backlog" element={<ProductBacklog />} />
          <Route path="/mkt" element={<MarketingBoard />} />
          <Route path="/media" element={<MediaBoard />} />
          <Route path="/sale" element={<SaleBoard />} />
          <Route path="/sprint" element={<SprintBoard />} />
          <Route path="/daily-sync" element={<DailySync />} />
          <Route path="/sync" element={<SaturdaySync />} />
          <Route path="/lead-tracker" element={<LeadTracker />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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
